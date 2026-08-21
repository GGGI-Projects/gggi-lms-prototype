/**
 * The learner assistant's entire "brain": a plain keyword-overlap search
 * over one paragraph of prose, not a language model.
 *
 * WHY NOT A REAL MODEL: this is a front-end-only prototype with no backend to
 * call one from, and the client's actual requirement is narrower than "a real
 * chatbot" - an automatic, immediate answer to a learner's question, drawn
 * only from what staff have chosen to say, with an honest "I don't know"
 * when nothing matches rather than an invented answer. A same-tab keyword
 * search over admin-authored text delivers exactly that, with no request
 * ever leaving the learner's browser. A production build may replace the
 * matching below with a real model - see §11 of `docs/SRS.md` - but should
 * keep both guarantees: answers only from platform-approved text, and a
 * plain "I don't have that" rather than a guess.
 *
 * PURE AND FRAMEWORK-FREE ON PURPOSE, same reason `lib/permissions.ts` is:
 * it runs client-side, inside `ChatbotWidget`, on every keystroke's worth of
 * a question, and has no business reaching into the rest of the data layer.
 */

/** Common words that would otherwise overlap with almost any sentence and
 *  make every answer look equally relevant. Short and hand-picked rather
 *  than pulled from a library - this only ever runs over one short paragraph
 *  and a handful of words, so a stemmer or a stopword package would be a lot
 *  of weight for very little gain. */
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "is", "are",
  "was", "were", "be", "been", "being", "it", "its", "this", "that", "these",
  "those", "with", "from", "by", "as", "at", "into", "than", "then", "so",
  "do", "does", "did", "can", "could", "will", "would", "should", "shall",
  "what", "which", "who", "whom", "how", "when", "where", "why", "about",
  "you", "your", "i", "me", "my", "we", "our", "they", "their", "them",
  "there", "here", "not", "no", "any", "all", "one", "get", "have", "has",
  "had", "if", "but", "up", "out", "just", "tell", "please", "some",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

/** Splits on sentence-ending punctuation followed by whitespace - good
 *  enough for the plain prose this runs over, with no abbreviations to trip
 *  it up (see the knowledge base itself in `content/operations.ts`). */
function splitSentences(paragraph: string): string[] {
  return paragraph
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export type ChatAnswer = {
  text: string;
  /** Whether anything in the knowledge base overlapped the question at all -
   *  lets the caller style a genuine answer differently from the fallback,
   *  without re-running the search to find out. */
  matched: boolean;
};

/** What the assistant says when nothing in the knowledge base is a
 *  reasonable match - an honest gap rather than an invented answer, and a
 *  pointer at the one real fallback the platform actually has (see §4.25). */
export const CHATBOT_FALLBACK =
  "I don't have anything on that yet - I can only answer from what's been written into my knowledge base. Try asking about a module, quizzes, certificates or a lecturer, or message a lecturer directly from your notifications if you need a real answer.";

/**
 * The top one or two sentences of `knowledgeBase` that share the most words
 * with `question`, joined as the answer - or `CHATBOT_FALLBACK` if none of
 * them share anything.
 */
export function answerFromKnowledgeBase(
  question: string,
  knowledgeBase: string,
): ChatAnswer {
  const questionTokens = new Set(tokenize(question));
  const sentences = splitSentences(knowledgeBase);
  if (!questionTokens.size || !sentences.length) {
    return { text: CHATBOT_FALLBACK, matched: false };
  }

  const scored = sentences
    .map((sentence) => {
      const overlap = tokenize(sentence).filter((word) =>
        questionTokens.has(word),
      ).length;
      return { sentence, overlap };
    })
    .filter((entry) => entry.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap);

  if (!scored.length) {
    return { text: CHATBOT_FALLBACK, matched: false };
  }

  const text = scored
    .slice(0, 2)
    .map((entry) => entry.sentence)
    .join(" ");
  return { text, matched: true };
}
