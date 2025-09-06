import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { feedQuerySchema } from "@/lib/validations"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queryParams = {
      channelId: searchParams.get('channelId') || undefined,
      filter: searchParams.get('filter') || 'all',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    }

    const { channelId, filter, page, limit } = feedQuerySchema.parse(queryParams)
    const offset = (page - 1) * limit
    const now = new Date()

    // Get user's channels
    const userChannels = await prisma.channelMember.findMany({
      where: { userId: session.user.id },
      include: { channel: { select: { id: true, name: true } } }
    })

    const userChannelIds = userChannels.map(m => m.channelId)
    const channels = userChannels.map(m => ({ id: m.channel.id, name: m.channel.name }))

    if (userChannelIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          proposals: [],
          channels: [],
          pagination: { page, limit, total: 0, pages: 0 }
        }
      })
    }

    // Build base where clause
    const whereClause: Record<string, unknown> = {
      channelId: channelId ? channelId : { in: userChannelIds }
    }

    // Verify channel access if specific channel requested
    if (channelId && !userChannelIds.includes(channelId)) {
      return NextResponse.json({ error: "Not a member of this channel" }, { status: 403 })
    }

    // Get dismissed proposals to exclude
    const dismissedProposals = await prisma.proposalUserState.findMany({
      where: { 
        userId: session.user.id,
        state: 'dismissed'
      },
      select: { proposalId: true }
    })

    // Filter logic
    if (filter === 'all') {
      // Published, not expired, not dismissed
      whereClause.AND = [
        {
          OR: [
            { publishAt: null },
            { publishAt: { lte: now } }
          ]
        },
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } }
          ]
        }
      ]
      
      if (dismissedProposals.length > 0) {
        whereClause.id = {
          notIn: dismissedProposals.map(d => d.proposalId)
        }
      }
    } else if (filter === 'active') {
      // Same as 'all' but explicitly not expired
      whereClause.AND = [
        {
          OR: [
            { publishAt: null },
            { publishAt: { lte: now } }
          ]
        },
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } }
          ]
        }
      ]
    } else if (filter === 'expired') {
      // Only expired proposals
      whereClause.AND = [
        {
          OR: [
            { publishAt: null },
            { publishAt: { lte: now } }
          ]
        },
        {
          expiresAt: { lt: now }
        }
      ]
    } else if (filter === 'supported') {
      // User has supported
      const userSupports = await prisma.supportSignal.findMany({
        where: { 
          userId: session.user.id,
          type: { in: ['support', 'supersupport'] }
        },
        select: { proposalId: true }
      })
      
      if (userSupports.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            proposals: [],
            pagination: { page, limit, total: 0, pages: 0 }
          }
        })
      }
      
      whereClause.id = {
        in: userSupports.map(s => s.proposalId)
      }
    } else if (filter === 'starred') {
      // User has starred
      const userStarred = await prisma.proposalUserState.findMany({
        where: { 
          userId: session.user.id,
          state: 'starred'
        },
        select: { proposalId: true }
      })
      
      if (userStarred.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            proposals: [],
            pagination: { page, limit, total: 0, pages: 0 }
          }
        })
      }
      
      whereClause.id = {
        in: userStarred.map(s => s.proposalId)
      }
    }

    const proposals = await prisma.proposal.findMany({
      where: whereClause,
      include: {
        channel: true,
        owner: true,
        images: {
          orderBy: { order: 'asc' }
        },
        supports: {
          where: { userId: session.user.id }
        },
        states: {
          where: { userId: session.user.id }
        },
        _count: {
          select: {
            supports: true
          }
        }
      },
      orderBy: filter === 'expired' 
        ? { expiresAt: 'desc' }
        : { createdAt: 'asc' }, // FIFO ordering
      skip: offset,
      take: limit,
    })

    // Get support stats for each proposal
    const proposalsWithStats = await Promise.all(
      proposals.map(async (proposal) => {
        const supportCounts = await prisma.supportSignal.groupBy({
          by: ['type'],
          where: { proposalId: proposal.id },
          _count: true
        })

        const stats = {
          supports: supportCounts.find(s => s.type === 'support')?._count || 0,
          supersupports: supportCounts.find(s => s.type === 'supersupport')?._count || 0,
          opposes: supportCounts.find(s => s.type === 'oppose')?._count || 0,
        }

        return {
          ...proposal,
          supportStats: stats
        }
      })
    )

    // Get total count for pagination
    const total = await prisma.proposal.count({ where: whereClause })

    return NextResponse.json({
      success: true,
      data: {
        proposals: proposalsWithStats,
        channels: channels,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        }
      },
    })
  } catch (error) {
    console.error("Error fetching feed:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 