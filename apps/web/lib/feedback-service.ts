export async function sendPublicFeedback(note: number, refUserId: string) {
  const token = process.env.NEXT_PUBLIC_FEEDBACK_TOKEN

  if (!token) {
    console.error('Feedback Token not found in environment variables')
    return { success: false, message: 'Configuração ausente' }
  }

  try {
    const response = await fetch('/api/v1/public/feedbacks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-project-token': token,
      },
      body: JSON.stringify({
        refUserId,
        note,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, message: error.message || 'Falha ao enviar feedback' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending feedback:', error)
    return { success: false, message: 'Erro de conexão' }
  }
}
