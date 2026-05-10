'use client'

import { LessonEditor } from '@/components/lesson-editor'
import { PlaygroundEditor } from '@/components/playground-editor'

export default function Home() {
  const params = new URLSearchParams(window.location.search)
  const mode = params.get('mode')

  if (mode === 'playground') {
    return <PlaygroundEditor />
  }

  return <LessonEditor />
}
