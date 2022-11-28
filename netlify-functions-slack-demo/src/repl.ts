const stopwords = [
  "about",
  "after",
  "all",
  "also",
  "am",
  "an",
  "and",
  "another",
  "any",
  "are",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "between",
  "both",
  "but",
  "by",
  "came",
  "can",
  "come",
  "could",
  "did",
  "do",
  "each",
  "for",
  "from",
  "get",
  "got",
  "has",
  "had",
  "he",
  "have",
  "her",
  "here",
  "him",
  "himself",
  "his",
  "how",
  "if",
  "in",
  "into",
  "is",
  "it",
  "like",
  "make",
  "many",
  "me",
  "might",
  "more",
  "most",
  "much",
  "must",
  "my",
  "never",
  "now",
  "of",
  "on",
  "only",
  "or",
  "other",
  "our",
  "out",
  "over",
  "said",
  "same",
  "should",
  "since",
  "some",
  "still",
  "such",
  "take",
  "than",
  "that",
  "the",
  "their",
  "them",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "up",
  "very",
  "was",
  "way",
  "we",
  "well",
  "were",
  "what",
  "where",
  "which",
  "while",
  "who",
  "with",
  "would",
  "you",
  "your",
  "a",
  "i",
];

const messages = [
  // custom
  "ligma johnson had it coming",
  // if input = elon
  "Oh hi lol",
  "A tragic case of adult onset Tourette's",
  // from bot
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
  "Three words: Twitter for dogs.",
  "Time is money. I want to see 100 lines written by lunchtime!",
  "Twitter was never profitable. Not my fault. Stop blaming me for things.",
  "Twitter will be introducing an enterprise tier for our corporate customers, featuring an internal Twitter for the company. Think of the use cases!",
  "Twitter will be introducing an enterprise tier for our corporate customers: an internal Twitter for the company. Think of the use cases!",
  'What do you mean "you couldn\'t code your way out of a paper bag"?',
  'What is "refactoring"?',
  "Whoever writes the most code this month gets featured on my Twitter!",
  "Why are we still serving free lunch?",
  "Why are you unhappy? No one should be unhappy at Twitter. Fired!",
  "Why aren't we using Rust for this? It's memory safe.",
  "Why have you only written 20 lines of code today?",
  "Why haven't we gone serverless yet?",
  "Yeah, looks like we're gonna need to redo the entire tech stack.",
  "You look stupid. Fired.",
  "You're either hardcore or out the door.",
];

const levenshteinDistance = (s: string, t: string) => {
  if (!s.length) return t.length;
  if (!t.length) return s.length;
  const arr = [];
  for (let i = 0; i <= t.length; i++) {
    arr[i] = [i];
    for (let j = 1; j <= s.length; j++) {
      arr[i][j] =
        i === 0
          ? j
          : Math.min(
              arr[i - 1][j] + 1,
              arr[i][j - 1] + 1,
              arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
            );
    }
  }
  return arr[t.length][s.length];
};

export const worksCompare = (message: string): string => {
  //   const x = messages.map((y) => {
  //     return {
  //       text: y,
  //       distance: levenshteinDistance(message, y),
  //     };
  //   });
  return messages[Math.floor(messages.length * Math.random())];

  if (Math.random() > 0.5) {
    return messages[Math.floor(messages.length * Math.random())];
  } else {
    const scores = messages.map((item) => {
      let baseSet = new Set(
        message
          .toLowerCase()
          .replace(new RegExp("\\b(" + stopwords.join("|") + ")\\b", "g"), "")
          .split(" ")
      );
      let compareSet = new Set(
        item
          .toLowerCase()
          .replace(new RegExp("\\b(" + stopwords.join("|") + ")\\b", "g"), "")
          .split(" ")
      );
      return {
        text: item,
        size: new Set(
          [...baseSet].filter((x) => compareSet.has(x) || item.includes(x))
        ).size,
      };
    });
    scores.sort((a, b) => {
      return a.size - b.size;
    });
    return scores[0].text;
  }
};
