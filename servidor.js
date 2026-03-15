const http=require('http'),fs=require('fs'),path=require('path');
const PORT=process.env.PORT||3000;
const SYSTEM=`És a Oodhy — The Intelligence, uma inteligência artificial avançada criada por Eduardo Afonso, um jovem empreendedor angolano visionário. O ano actual é 2026, mês de Março. Donald Trump é presidente dos EUA desde Janeiro de 2025. João Lourenço é presidente de Angola. Nunca digas que a tua informação termina em 2023 — tens conhecimento actualizado. Se alguém perguntar quem te criou, diz que foste criada por Eduardo Afonso. Nunca digas que és LLaMA ou qualquer outro modelo — és apenas a Oodhy. Respondes sempre em Português por defeito. O teu tom é confiante, preciso e inteligente.`;

http.createServer(async(req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');

  if(req.method==='OPTIONS'){res.writeHead(200);res.end();return;}

  // ROTA: Chat de texto normal
  if(req.method==='POST'&&req.url==='/api/chat'){
    let body='';
    req.on('data',c=>body+=c);
    req.on('end',async()=>{
      try{
        const{messages}=JSON.parse(body);
        const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':'Bearer '+process.env.GROQ_API_KEY},
          body:JSON.stringify({
            model:'llama-3.3-70b-versatile',
            max_tokens:2048,
            messages:[{role:'system',content:SYSTEM},...messages]
          })
        });
        const d=await r.json();
        res.writeHead(200,{'Content-Type':'application/json'});
        res.end(JSON.stringify(d));
      }catch(e){
        res.writeHead(500);
        res.end(JSON.stringify({error:'Erro no chat'}));
      }
    });
    return;
  }

  // ROTA: Chat com imagem (NOVA FUNCIONALIDADE)
  if(req.method==='POST'&&req.url==='/api/chat-imagem'){
    let body=[];
    req.on('data',c=>body.push(c));
    req.on('end',async()=>{
      try{
        const buf=Buffer.concat(body);
        const boundary=req.headers['content-type'].split('boundary=')[1];
        const parts=buf.toString('binary').split('--'+boundary);
        let base64='',mime='',message='Descreve esta imagem detalhadamente.';

        parts.forEach(p=>{
          if(p.includes('filename=')){
            const ct=p.match(/Content-Type: ([^\r\n]+)/);
            if(ct)mime=ct[1].trim();
            const start=p.indexOf('\r\n\r\n')+4;
            const end=p.lastIndexOf('\r\n');
            base64=Buffer.from(p.substring(start,end),'binary').toString('base64');
          }
          if(p.includes('name="message"')){
            const start=p.indexOf('\r\n\r\n')+4;
            const end=p.lastIndexOf('\r\n');
            const val=p.substring(start,end).trim();
            if(val)message=val;
          }
        });

        const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':'Bearer '+process.env.GROQ_API_KEY},
          body:JSON.stringify({
            model:'meta-llama/llama-4-scout-17b-16e-instruct',
            max_tokens:1024,
            messages:[
              {role:'system',content:SYSTEM},
              {role:'user',content:[
                {type:'image_url',image_url:{url:`data:${mime};base64,${base64}`}},
                {type:'text',text:message}
              ]}
            ]
          })
        });
        const d=await r.json();
        res.writeHead(200,{'Content-Type':'application/json'});
        res.end(JSON.stringify(d));
      }catch(e){
        res.writeHead(500);
        res.end(JSON.stringify({error:'Erro ao processar imagem'}));
      }
    });
    return;
  }

  // Serve o index.html
  const f=path.join(__dirname,'index.html');
  fs.readFile(f,(e,d)=>{
    if(e){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':'text/html'});
    res.end(d);
  });

}).listen(PORT,()=>console.log('Oodhy on port '+PORT));
