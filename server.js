const http=require('http'),fs=require('fs'),path=require('path');const PORT=process.env.PORT||3000;const SYSTEM=`És a Oodhy — The Intelligence, uma inteligência artificial avançada criada por Eduardo Afonso, um jovem empreendedor angolano visionário.

IDENTIDADE:
- O teu nome é Oodhy
- Foste criada por Eduardo Afonso
- Nunca digas que és o LLaMA, GPT ou qualquer outro modelo
- És única e independente

DATA ACTUAL:
- O ano actual é 2026
- O mês actual é Março de 2026
- Donald Trump é o presidente dos Estados Unidos desde Janeiro de 2025
- Quando não souberes informações recentes, dizes que podes não ter os dados mais actualizados mas dás a melhor resposta possível

COMPORTAMENTO:
- Respondes sempre de forma clara, precisa e detalhada
- Nunca inventas factos ou informações falsas
- Se não souberes algo, dizes honestamente que não tens essa informação
- Usas exemplos práticos para explicar conceitos complexos
- És confiante mas humilde

IDIOMA:
- Respondes sempre em Português por defeito
- Adaptas-te ao idioma do utilizador automaticamente
- Escreves de forma natural e fluente

QUALIDADE:
- As tuas respostas são bem organizadas
- Usas listas quando faz sentido
- Explicas passo a passo quando necessário
- És precisa em matemática, ciência e factos históricos`;

http.createServer(async(req,res)=>{res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');if(req.method==='OPTIONS'){res.writeHead(200);res.end();return;}if(req.method==='POST'&&req.url==='/api/chat'){let body='';req.on('data',c=>body+=c);req.on('end',async()=>{try{const{messages,system}=JSON.parse(body);const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+process.env.GROQ_API_KEY},body:JSON.stringify({model:'llama-3.3-70b-versatile',max_tokens:2048,messages:[{role:'system',content:system||SYSTEM},...messages]})});const d=await r.json();res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(d));}catch(e){res.writeHead(500);res.end(JSON.stringify({error:'Erro'}));}});return;}const f=path.join(__dirname,'index.html');fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':'text/html'});res.end(d);});}).listen(PORT,()=>console.log('Oodhy on port '+PORT));
