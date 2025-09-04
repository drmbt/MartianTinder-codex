import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { joinChannelSchema } from "@/lib/validations"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { inviteCode } = joinChannelSchema.parse(body)

    // Find channel by invite code
    const channel = await prisma.channel.findUnique({
      where: { inviteCode },
      include: {
        members: {
          where: { userId: session.user.id }
        }
      }
    })

    if (!channel) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 })
    }

    // Check if user is already a member
    if (channel.members.length > 0) {
      return NextResponse.json({ error: "Already a member of this channel" }, { status: 400 })
    }

    // Add user as member
    await prisma.channelMember.create({
      data: {
        userId: session.user.id,
        channelId: channel.id,
        role: "member"
      }
    })

    return NextResponse.json({
      success: true,
      data: { channelId: channel.id, channelName: channel.name }
    })
  } catch (error) {
    console.error("Error joining channel:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 