import Anthropic from "@anthropic-ai/sdk";
import { PERGUNTAS_COLABORADOR, PERGUNTAS_LIDER } from "./competencias";

interface DadosAvaliacao {
  notas?: Record<string, number>;
  comentarios?: Record<string, string>;
  respostas?: Record<string, string>;
  comentarioGeral?: string;
}

function formatarRespostas(dados: DadosAvaliacao | null, perguntas: string[], label: string): string {
  if (!dados) return "";
  const partes: string[] = [];

  const comentarios = Object.entries(dados.comentarios ?? {}).filter(([, v]) => v?.trim());
  if (comentarios.length > 0) {
    partes.push(`Comentários por competência (${label}):\n` + comentarios.map(([k, v]) => `- ${k}: ${v}`).join("\n"));
  }

  const respostas = perguntas
    .map((p) => ({ pergunta: p, resposta: dados.respostas?.[p] }))
    .filter((r) => r.resposta?.trim());
  if (respostas.length > 0) {
    partes.push(`Respostas abertas (${label}):\n` + respostas.map((r) => `P: ${r.pergunta}\nR: ${r.resposta}`).join("\n\n"));
  }

  if (dados.comentarioGeral?.trim()) {
    partes.push(`Comentário geral (${label}): ${dados.comentarioGeral}`);
  }

  return partes.join("\n\n");
}

export async function gerarSintese(params: {
  colaboradorNome: string;
  cargo: string;
  periodo: string;
  auto: DadosAvaliacao | null;
  lider: DadosAvaliacao | null;
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return "";

  const textoAuto = formatarRespostas(params.auto, PERGUNTAS_COLABORADOR, "Colaborador");
  const textoLider = formatarRespostas(params.lider, PERGUNTAS_LIDER, "Líder");

  if (!textoAuto && !textoLider) return "";

  const prompt = `Você é um especialista em desenvolvimento humano e avaliação de desempenho.
Com base nas respostas escritas abaixo, redija uma síntese narrativa objetiva e equilibrada para o relatório de PDI de ${params.colaboradorNome} (${params.cargo}), referente ao período ${params.periodo}.

A síntese deve:
- Ter entre 3 e 5 parágrafos curtos
- Integrar as perspectivas do colaborador e do líder de forma coesa
- Destacar pontos de convergência e divergência relevantes
- Usar linguagem profissional e construtiva, em português brasileiro
- Não repetir as perguntas nem as notas numéricas
- Ser direta, sem introduções do tipo "Com base nas respostas..."

${textoAuto ? `---\n${textoAuto}\n---` : ""}
${textoLider ? `---\n${textoLider}\n---` : ""}`;

  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  return content.type === "text" ? content.text : "";
}
