/**
 * Script de Geração de Feedback em Massa
 *
 * Uso: node scripts/seed-feedbacks.mjs
 */

const API_URL = 'http://localhost:5000/api/v1/public/feedbacks'
const TOKEN = 'JAReXjUndIhIrPwFnOaEQnKMc7vt_IXc6C3IhYahzKs'

async function seed() {
  const totalRequests = Math.floor(Math.random() * 20) + 15 // Entre 15 e 35 disparos
  console.log(`🚀 Iniciando disparo em massa de ${totalRequests} feedbacks...`)

  for (let i = 1; i <= totalRequests; i++) {
    const randomId = `user_${Math.random().toString(36).substring(2, 10)}`
    const randomNote = Math.floor(Math.random() * 5) + 1 // 1 a 5

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-project-token': TOKEN,
        },
        body: JSON.stringify({
          refUserId: randomId,
          note: randomNote,
        }),
      })

      if (response.ok) {
        console.log(
          `[${i}/${totalRequests}] ✅ Feedback enviado: ID=${randomId}, Nota=${randomNote}`,
        )
      } else {
        console.error(`[${i}/${totalRequests}] ❌ Erro: ${response.status}`)
      }
    } catch (error) {
      console.error(`[${i}/${totalRequests}] ❌ Falha de conexão:`, error.message)
    }

    // Pequeno delay para não sobrecarregar
    await new Promise(r => setTimeout(r, 100))
  }

  console.log('\n✨ Processo finalizado com sucesso!')
}

seed()
