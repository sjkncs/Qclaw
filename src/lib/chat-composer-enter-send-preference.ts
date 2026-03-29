export type ChatComposerEnterSendMode = 'enter' | 'shiftEnter' | 'altEnter'

const ENTER_SEND_MODE_STORAGE_KEY = 'qclaw-chat-composer-enter-send-mode'

const DEFAULT_ENTER_SEND_MODE: ChatComposerEnterSendMode = 'shiftEnter'

const VALID_MODES: ChatComposerEnterSendMode[] = ['enter', 'shiftEnter', 'altEnter']

function getLocalStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

export function readChatComposerEnterSendMode(): ChatComposerEnterSendMode {
  const storage = getLocalStorage()
  if (!storage) return DEFAULT_ENTER_SEND_MODE

  try {
    const stored = storage.getItem(ENTER_SEND_MODE_STORAGE_KEY)
    if (stored && (VALID_MODES as string[]).includes(stored)) {
      return stored as ChatComposerEnterSendMode
    }
    return DEFAULT_ENTER_SEND_MODE
  } catch {
    return DEFAULT_ENTER_SEND_MODE
  }
}

export function writeChatComposerEnterSendMode(mode: ChatComposerEnterSendMode): void {
  const storage = getLocalStorage()
  if (!storage) return

  try {
    storage.setItem(ENTER_SEND_MODE_STORAGE_KEY, mode)
  } catch {}
}

export { ENTER_SEND_MODE_STORAGE_KEY, DEFAULT_ENTER_SEND_MODE }
