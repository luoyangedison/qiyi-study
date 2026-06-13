// Vercel Serverless Function - AI API 代理
// 密钥存在 Vercel 环境变量，前端永远看不到

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: '缺少 messages 参数' });
  }

  const apiKey = process.env.SILICONFLOW_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '服务端未配置 API Key' });
  }

  try {
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3',
        messages: messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `AI 服务异常: ${errText}` });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return res.status(200).json({
      content: content,
      choices: data.choices,
    });
  } catch (e) {
    return res.status(500).json({ error: `代理请求失败: ${e.message}` });
  }
}
