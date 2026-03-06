export type ChatRequest = {
  message: string;
};

export type ChatDeltaEvent = {
  type: "delta";
  content: string;
};

export type ChatReferencesEvent = {
  type: "references";
  posts: ChatReferencePost[];
};

export type ChatErrorEvent = {
  type: "error";
  message: string;
};

export type ChatReferencePost = {
  slug: string;
  title: string;
};

export type ChatEvent = ChatDeltaEvent | ChatReferencesEvent | ChatErrorEvent;
