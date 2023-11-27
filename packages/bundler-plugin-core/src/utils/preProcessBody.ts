export const preProcessBody = (
  body: Record<string, string | null | undefined>,
) => {
  for (const [key, value] of Object.entries(body)) {
    if (!value || value === "") {
      body[key] = null;
    }
  }

  return body;
};
