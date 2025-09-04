import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createChannelSchema } from "@/lib/validations"
import { generateInviteCode } from "@/lib/utils"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userChannels = await prisma.channelMember.findMany({
      where: { userId: session.user.id },
      include: {
        channel: {
          include: {
            _count: {
              select: {
                members: true,
                proposals: true
              }
            }
          }
        }
      },
    })

    return NextResponse.json({
      success: true,
      data: userChannels.map((m) => m.channel)
    })
  } catch (error) {
    console.error("Error fetching channels:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createChannelSchema.parse(body)

    const channel = await prisma.channel.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        inviteCode: generateInviteCode(),
        members: {
          create: {
            userId: session.user.id,
            role: "owner"
          }
        }
      },
      include: {
        _count: {
          select: {
            members: true,
            proposals: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: channel
    })
  } catch (error) {
    console.error("Error creating channel:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 