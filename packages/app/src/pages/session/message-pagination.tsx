import { For, createMemo, createSignal } from "solid-js"
import type { UserMessage } from "@opencode-ai/sdk/v2"
import { Tooltip } from "@opencode-ai/ui/tooltip"

interface MessagePaginationProps {
  messages: UserMessage[]
  activeMessageId: string | undefined
  onDotClick: (messageId: string) => void
}

function getMessagePreview(messageId: string): string {
  const element = document.querySelector(`[data-message-id="${messageId}"]`)
  if (!element) return ""

  const textElement = element.querySelector('[data-slot="user-message-text"]')
  if (!textElement) return ""

  const textContent = textElement.textContent || ""
  return textContent
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300)
}

function truncateLines(text: string, maxLines: number, maxChars: number): string {
  if (text.length > maxChars) {
    return text.slice(0, maxChars).trim() + "..."
  }
  const lines = text.split("\n")
  if (lines.length > maxLines) {
    return lines.slice(0, maxLines).join("\n").trim() + "..."
  }
  return text
}

export function MessagePagination(props: MessagePaginationProps) {
  const [previews, setPreviews] = createSignal<Record<string, string>>({})

  const userMessageIds = createMemo(() => props.messages.map((m) => m.id))

  const updatePreview = (messageId: string) => {
    const preview = getMessagePreview(messageId)
    setPreviews((prev) => ({ ...prev, [messageId]: preview }))
  }

  const handleMouseEnter = (messageId: string) => {
    if (!previews()[messageId]) {
      updatePreview(messageId)
    }
  }

  const scrollToMessage = (messageId: string) => {
    props.onDotClick(messageId)
  }

  return (
    <div class="message-pagination">
      <div class="message-pagination-dots">
        <For each={userMessageIds()}>
          {(messageId) => {
            const isActive = createMemo(() => props.activeMessageId === messageId)
            const preview = createMemo(() => {
              const text = previews()[messageId] || ""
              return truncateLines(text, 5, 280)
            })

            return (
              <Tooltip
                placement="left"
                openDelay={0}
                value={
                  <div class="message-pagination-tooltip">
                    {preview() || "..."}
                  </div>
                }
                contentClass="message-pagination-tooltip-content"
              >
                <button
                  class="message-pagination-dot"
                  classList={{
                    "message-pagination-dot--active": isActive(),
                  }}
                  onMouseEnter={() => handleMouseEnter(messageId)}
                  onMouseLeave={() => {}}
                  onClick={() => scrollToMessage(messageId)}
                  aria-label={`Go to message ${messageId}`}
                />
              </Tooltip>
            )
          }}
        </For>
      </div>
    </div>
  )
}
