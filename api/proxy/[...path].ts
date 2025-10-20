import type { VercelRequest, VercelResponse } from '@vercel/node';

const RAILWAY_API_URL = 'https://boston-english-server.railway.app/api/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // catch-all 경로 파라미터 가져오기
    const pathArray = req.query.path as string[];
    const path = pathArray ? `/${pathArray.join('/')}` : '';

    // 쿼리 파라미터 처리
    const queryString = req.url?.split('?')[1];
    const targetUrl = `${RAILWAY_API_URL}${path}${queryString ? `?${queryString}` : ''}`;

    console.log(`🔄 Proxying ${req.method} ${path} to ${targetUrl}`);

    // 요청 본문
    const body = req.method !== 'GET' && req.method !== 'HEAD'
      ? JSON.stringify(req.body)
      : undefined;

    // Railway 서버로 요청 전달
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || '',
      },
      body: body
    });

    // 응답 데이터
    const data = await response.text();
    let jsonData;

    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = { message: data };
    }

    console.log(`✅ Proxy response: ${response.status}`);

    // 응답 반환
    res.status(response.status).json(jsonData);
  } catch (error: any) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({
      success: false,
      message: 'Proxy error: ' + error.message
    });
  }
}
