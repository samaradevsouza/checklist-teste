const SUPABASE_URL = "https://hptrwymemfnzcwtllxfo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwdHJ3eW1lbWZuemN3dGxseGZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjQwOTksImV4cCI6MjA3Mjk0MDA5OX0.F2mHT_qMlAFSKYoQ7WOXIJSjq7PI82OOk_BE1OMqmjI";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let clientes = [];
let itensChecklist = [];

async function carregarClientePorNome(nome) {
    if (!nome) return;

    try {
        const { data, error } = await supabaseClient
            .from("requerentes")
            .select("*")
            .ilike("nome_completo", `%${nome}%`);

        if (error) throw error;
        if (!data || data.length === 0) {
            alert("Cliente não encontrado!");
            return;
        }

        const cliente = data[0];
        clientes = [cliente];

        document.getElementById("nome").textContent = cliente.nome_completo;
        document.getElementById("email").textContent = cliente.email || "";
        document.getElementById("endereco").textContent = cliente.endereco || "";
        document.getElementById("cidade").textContent = cliente.cidade || "";
        document.getElementById("estado").textContent = cliente.estado || "";
        document.getElementById("cep").textContent = cliente.cep || "";

        document.getElementById("dadosCliente").style.display = "block";
        document.getElementById("checklist").style.display = "block";

    } catch (err) {
        console.error(err);
        alert("Não foi possível carregar o cliente. Verifique a API.");
    }
}

document.getElementById("formularioBusca").addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = document.getElementById("nomeCliente").value.trim();
    carregarClientePorNome(nome);
});

function adicionarItem() {
    const container = document.getElementById("itens");
    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
<div style="display: flex; justify-content: space-between;">        
<select style="width: 45%;">
            <option value="Acta de Nascimento Espanhola emitida pelo Ministério da Justiça Espanhol">Acta de Nascimento</option>
            <option value="Certidão de Nascimento">Certidão de Nascimento</option>
            <option value="Certidão de Casamento">Certidão de Casamento</option>
            <option value="Certidão Negativa de Naturalização">CNN</option>
            <option value="Anexo I">Anexo I</option>
            <option value="Anexo III">Anexo III</option>
            <option value="Datos Nacimientos">Datos Nacimientos</option>
            <option value="Solicitud de Inscripción como residente">Solicitud</option>
        </select>
        <input type="text" placeholder="Nome do titular" style="width: 45%;">
        <button type="button" onclick="removerItem(this)" style="width: 5%;">X</button> </div>
    `;
    container.appendChild(div);
}

function removerItem(botao) {
    const item = botao.parentElement;
    item.remove();
}

function gerarResultado() {
    const lista = document.getElementById("listaFinal");
    lista.innerHTML = "";
    itensChecklist = [];

    const itens = document.querySelectorAll("#itens .item");
    itens.forEach(item => {
        const select = item.querySelector("select").value;
        const nome = item.querySelector("input").value.trim();
        if (nome !== "") {
            let texto = "";
            if (select === "Acta de Nascimento Espanhola emitida pelo Ministério da Justiça Espanhol") {
                texto = `${select} de ${nome}, via digital`;
            } else if (select === "Certidão Negativa de Naturalização") {
                texto = `${select} de ${nome}, com apostille na via digital`;
            } else if (select === "Anexo I" || select === "Anexo III") {
                texto = `${select}, (3 vias preenchida e 1 via em branco)`;
            } else if (select === "Datos Nacimientos" || select === "Solicitud de Inscripción como residente") {
                texto = `${select}, (2 vias preenchidas e 1 via em branco)`;
            } else {
                texto = `${select} de ${nome}, com apostille na via original`;
            }

            itensChecklist.push(texto);

            const li = document.createElement("li");
            li.textContent = texto;
            lista.appendChild(li);
        }
    });

    document.getElementById("resultado").style.display = "block";
}

function exportarWord() {
    const nome = document.getElementById("nome").textContent;
    const endereco = document.getElementById("endereco").textContent;
    const cidade = document.getElementById("cidade").textContent;
    const estado = document.getElementById("estado").textContent;
    const cep = document.getElementById("cep").textContent;

    const nomeCliente = document.getElementById("nomeClienteApp").value;
    const tipoProcesso = document.getElementById("tipoProcesso").value;
    const atividadeEnvio = document.getElementById("atividadeEnvio").value;

    const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...";

    let conteudo = `<html xmlns:o='urn:schemas-microsoft-com:office:office' 
                xmlns:w='urn:schemas-microsoft-com:office:word' 
                xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><style>
            body { font-family: Arial, sans-serif; font-size: 12pt;}
            ul, li { list-style-type: none; margin: 0; padding: 0; }   
            h3 { border: 1px solid black; padding: 5px; }
            #header { color: #740529; margin: 10px 0; line-height: 5px;}
            #header p { font-size: 1.2em; }
        </style></head>
        <body>
        <h2><b>Checklist Espanha</b></h2>
        <div id="header">
        <p>${tipoProcesso}</p>
        <p>Cliente: ${nomeCliente}</p>
        <p><b>Requerente: ${nome}</b></p>
        <p>Endereço: ${endereco}, ${cidade}, ${estado}, CEP: ${cep}</p>
        <p>Atividade de envio: ${atividadeEnvio}</p>
        </div>
        <h3>Importante: </h3>
        <h4>Documentos:</h4>
        `;

    itensChecklist.forEach(item => {
        conteudo += `<p>☐ ${item}</p>`;
    });

    conteudo += `</body></html>`;

    const blob = new Blob(['\ufeff', conteudo], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Checklist_${nome}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
