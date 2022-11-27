import { ReceiverEvent } from "@slack/bolt";
import {
  ISlackPrivateReply,
  ISlackReactionReply,
  ISlackReply,
} from "./constants";

export function parseRequestBody(
  stringBody: string | null,
  contentType: string | undefined
): any | undefined {
  try {
    if (!stringBody) {
      return "";
    }

    let result: any = {};

    if (contentType && contentType === "application/json") {
      return JSON.parse(stringBody);
    }

    let keyValuePairs: string[] = stringBody.split("&");
    keyValuePairs.forEach(function (pair: string): void {
      let individualKeyValuePair: string[] = pair.split("=");
      result[individualKeyValuePair[0]] = decodeURIComponent(
        individualKeyValuePair[1] || ""
      );
    });
    return JSON.parse(JSON.stringify(result));
  } catch {
    return "";
  }
}

export function generateReceiverEvent(payload: any): ReceiverEvent {
  return {
    body: payload,
    ack: async (response): Promise<any> => {
      return {
        statusCode: 200,
        body: response ?? "",
      };
    },
  };
}

export function isUrlVerificationRequest(payload: any): boolean {
  if (payload && payload.type && payload.type === "url_verification") {
    return true;
  }
  return false;
}

export async function replyMessage(messagePacket: ISlackReply): Promise<void> {
  try {
    await messagePacket.app.client.chat.postMessage({
      token: messagePacket.botToken,
      channel: messagePacket.channelId,
      thread_ts: messagePacket.threadTimestamp,
      text: messagePacket.message,
    });
  } catch (error) {
    console.error(error);
  }
}

export async function replyReaction(
  reactionPacket: ISlackReactionReply
): Promise<void> {
  try {
    await reactionPacket.app.client.reactions.add({
      token: reactionPacket.botToken,
      name: reactionPacket.reaction,
      channel: reactionPacket.channelId,
      timestamp: reactionPacket.threadTimestamp,
    });
  } catch (error) {
    console.error(error);
  }
}

export async function replyPrivateMessage(
  messagePacket: ISlackPrivateReply
): Promise<void> {
  try {
    await messagePacket.app.client.chat.postEphemeral({
      token: messagePacket.botToken,
      channel: messagePacket.channelId,
      text: messagePacket.message,
      user: messagePacket.userId,
    });
  } catch (error) {
    console.error(error);
  }
}

export function muskSpeak(): string {
  const messages = [
    "Can this be dockerized?",
    "Can we rewrite this in Java? It's better for enterprise.",
    "Disagreeing with me is counterproductive. Fired.",
    "Due to unforeseen circumstances, you will now be receiving your salaries in Elon Bucks, accepted at any Tesla location!",
    "From now on, all Twitter employees must purchase a subscription to Twitter Blue for the low-low price of $8 a month.",
    "Guys, this is a big misunderstanding. I was playing truth or dare with Jeff and Bill and they dared me to buy Twitter. What else was I supposed to do??",
    "Hey, I just heard about this thing called GraphQL. Why aren't we using it?",
    "How can we use Bitcoin to solve this?",
    "I don't think I appreciate your tone. Fired.",
    "I have made promises to the shareholders that I definitely *cannot* keep, so I need you all to work TWICE as hard!",
    "I'm gonna need you to come in on Saturday...",
    "I've laid off most of the staff, and Twitter's still running. Looks like they weren't necessary.",
    "If you can't build a computer out of transistors, you shouldn't be working here.",
    "If you really love the company, you should be willing to work here for free.",
    "Insubordination. Fired.",
    "Interesting. Tell me more.",
    "Interns will happily work for $15 an hour. Why won't you?",
    "It's now company policy to use Vim for editing. It lets you write code much faster.",
    "Just watched a video about how vanilla JS is faster than any framework. It's time we do a rewrite.",
    "Looks like we're gonna need to trim the fat around here... fired.",
    "One more word out of you, and you're fired.",
    "Pop quiz! Solve this LeetCode problem in 5 minutes or you're fired.",
    "QA is a waste of money. Fired.",
    "Send me your 10 most salient Reddit comments.",
    "Time is money. I want to see 100 lines written by lunchtime!",
    "Twitter was never profitable. Not my fault. Stop blaming me for things.",
    'What do you mean "you couldn\'t code your way out of a paper bag"?',
    'What is "refactoring"?',
    "Whoever writes the most code this month gets featured on my Twitter!",
    "Why are we still serving free lunch?",
    "Why aren't we using Rust for this? It's memory safe.",
    "Why have you only written 20 lines of code today?",
    "Why haven't we gone serverless yet?",
    "Yeah, looks like we're gonna need to redo the entire tech stack.",
    "You look stupid. Fired.",
    "You're either hardcore or out the door.",
  ];

  return messages[Math.floor(messages.length * Math.random())];
}
