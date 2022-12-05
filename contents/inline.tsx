import cssText from 'data-text:~style.css'
import type { PlasmoContentScript, PlasmoGetInlineAnchor } from 'plasmo'
import type { SyntheticEvent } from 'react'

import '../style.css'

import { downloadFile, getConversationThread } from './utils'

export const config: PlasmoContentScript = {
  matches: ['https://chat.openai.com/chat']
}

export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

export const getInlineAnchor: PlasmoGetInlineAnchor = async () =>
  document.querySelector('nav > a:last-child')

function PlasmoInline() {
  const saveThread = (e: SyntheticEvent) => {
    e.preventDefault()
    const nodeWrapper = document.querySelector(
      '[class*="ThreadLayout__NodeWrapper"]'
    )

    const conversationItems = Array.from(nodeWrapper.children).filter(
      ({ className }) => className.includes('ConversationItem')
    )

    const thread = getConversationThread(conversationItems)

    const markdownString = thread.reduce(
      (str, bubble, index, array) =>
        (str += `Sender: ${bubble.sender}\n\nMessage:\n${bubble.content}\n\n${
          index < array.length - 1 ? '---\n' : ''
        }`),
      ''
    )

    downloadFile(markdownString)
  }

  return (
    <div className="w-full py-1 flex flex-col items-center gap-2 justify-center mt-2">
      <button
        onClick={saveThread}
        className="bg-green-400 text-gray-800 hover:bg-green-500 font-bold py-2 px-4 rounded inline-flex items-center disabled:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed">
        <svg
          className="w-4 h-4 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor">
          <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
        </svg>
        <span>Download Thread</span>
      </button>
      <a className="text-sm" href="https://github.com/rodpadev">
        Report bug
      </a>
    </div>
  )
}

export default PlasmoInline
