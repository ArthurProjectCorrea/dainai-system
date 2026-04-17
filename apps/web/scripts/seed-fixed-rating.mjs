/**
 * Script de Geração de Feedback com Nota Fixa
 *
 * Uso: node scripts/seed-fixed-rating.mjs <nota> <quantidade>
 * Exemplo: node scripts/seed-fixed-rating.mjs 5 10
 */

const API_URL = 'http://localhost:5000/api/v1/public/feedbacks'
const TOKEN = '7PpwO3dJ3J1HR47tI3POJ7YCCNbqR6arvy34PY7joLk'

async function seed() {
  const args = process.argv.slice(2)
  const fixedNote = parseInt(args[0])
  const totalRequests = parseInt(args[1]) || 10

  if (isNaN(fixedNote) || fixedNote < 1 || fixedNote > 5) {
    console.error('❌ Erro: Você deve fornecer uma nota entre 1 e 5.')
    console.log('Uso: node scripts/seed-fixed-rating.mjs <nota> [quantidade]')
    process.exit(1)
  }

  console.log(
    `🚀 Iniciando disparo em massa de ${totalRequests} feedbacks com NOTA FIXA: ${fixedNote}...`,
  )

  for (let i = 1; i <= totalRequests; i++) {
    const randomId = `user_${Math.random().toString(36).substring(2, 10)}`

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-project-token': TOKEN,
        },
        body: JSON.stringify({
          refUserId: randomId,
          note: fixedNote,
        }),
      })

      if (response.ok) {
        console.log(
          `[${i}/${totalRequests}] ✅ Feedback enviado: ID=${randomId}, Nota=${fixedNote}`,
        )
      } else {
        console.error(`[${i}/${totalRequests}] ❌ Erro: ${response.status}`)
      }
    } catch (error) {
      console.error(`[${i}/${totalRequests}] ❌ Falha de conexão:`, error.message)
    }

    // Delay para não sobrecarregar o endpoint
    await new Promise(r => setTimeout(r, 100))
  }

  console.log('\n✨ Processo finalizado com sucesso!')
}

seed()
