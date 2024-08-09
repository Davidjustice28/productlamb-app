import OpenAI from "openai";

interface ConvertedBugData {
  bugs: { title: string, description: string, source: string }[]
}


interface ConvertedFeedbackData {
  feedback: { feedback: string, source: string }[]
}

interface ConvertedBacklogData {
  backlog: { title: string, description: string, reason: string, category: string }[]
}


export type ConvertedDataResponse = ConvertedBugData | ConvertedFeedbackData | ConvertedBacklogData


export function wrapOpenAIClient(apiKey: string) {
  const client = new OpenAI({ apiKey });
  async function performChat<T extends {} = {}>(prompt: string) {
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {"role": "system", "content": "You are a project manager for a small startup. You give help organize backlogs, suggest and plan work, and stay on top of the team."},
        {"role": "user", "content": prompt},
      ],
      response_format: { "type": "json_object" } 
    })
    const jsonContent = response.choices[0].message.content
    const data = JSON.parse(jsonContent!) as T
    return data
  }

  async function convertDataToInternalData(data: string, file_type: 'csv' | 'json', data_type: 'bugs' | 'backlog' | 'feedback') {
    // convert csv to internal data

    let schema: string | null = null
    if (data_type === 'bugs') {
      schema = ` {
          bugs: [
            {
              title: string,
              description: string,
              source: string,
            }
          ]
        }
      `
    } else if (data_type === 'backlog') {
      schema = `
        {
          backlog: [
            {
              title: string,
              description: string,
              reason: string,
              category: string, // bug, feature, chore, other
            }
          ]
        }
      `
    } else {
      schema = `
      {
        feedback: [
          {
            feedback: string,
            source: string,
          }
        ]
      }
      `
    }
    const prompt = `Given some ${file_type} content, try translating the following ${data_type === 'backlog' ? 'task backlog' : data_type} data into the following json response \n${schema}. All properties should be lowercase. The sole property in the json should be ${data_type}. Here's the data: ${data}`
    // convert json to internal

    try {
      const response = await performChat<ConvertedDataResponse>(prompt)
      return response
    } catch (e) {
      console.error(e)
      return null
    }
  }

  return {
    performChat,
    convertDataToInternalData
  }
}