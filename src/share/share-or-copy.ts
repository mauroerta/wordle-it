export async function shareOrCopy(text: string): Promise<"shared" | "copied"> {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ text })
      return "shared"
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw error
      }
    }
  }
  const area = document.createElement("textarea")
  area.textContent = text
  document.body.appendChild(area)
  area.select()
  const ok = document.execCommand("copy")
  document.body.removeChild(area)
  if (!ok) {
    throw new Error("copy failed")
  }
  return "copied"
}
