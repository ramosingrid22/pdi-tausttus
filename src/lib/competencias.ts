export const COMPETENCIAS_COMPORTAMENTAIS = [
  "Comprometimento",
  "Trabalho em equipe",
  "Comunicação",
  "Organização e disciplina",
  "Proatividade",
];

export const DESCRICOES_COMPORTAMENTAIS: Record<string, { definicao: string; notas: Record<number, string> }> = {
  "Comprometimento": {
    definicao: "Se importar com o resultado do trabalho, cumprir horários e combinados, e fazer a sua parte mesmo quando ninguém está olhando.",
    notas: {
      1: "Falta com frequência, não cumpre combinados e precisa ser cobrado(a) constantemente.",
      2: "Cumpre o básico, mas falha em prazos e combinados com frequência.",
      3: "Cumpre horários, prazos e responsabilidades combinadas.",
      4: "Vai além do combinado, se antecipa a problemas e assume responsabilidades extras.",
      5: "É referência de comprometimento e inspira os colegas pelo exemplo.",
    },
  },
  "Trabalho em equipe": {
    definicao: "Colaborar com os colegas, ajudar quando necessário e contribuir para um ambiente de trabalho saudável e produtivo.",
    notas: {
      1: "Trabalha isolado(a), gera conflitos ou dificulta o trabalho do time.",
      2: "Colabora pouco, ajuda apenas quando solicitado(a) diretamente.",
      3: "Colabora bem com o time, ajuda os colegas e contribui para um bom clima.",
      4: "Se antecipa para ajudar o time e facilita a integração entre áreas ou turnos.",
      5: "É elo entre as equipes, motiva o grupo e ajuda a resolver conflitos com maturidade.",
    },
  },
  "Comunicação": {
    definicao: "Passar informações de forma clara, ouvir colegas e líderes, e se expressar com respeito mesmo em momentos de pressão.",
    notas: {
      1: "Tem dificuldade de se expressar ou de ouvir, e gera ruídos e retrabalho.",
      2: "Comunica-se de forma confusa ou inconsistente, gerando mal-entendidos às vezes.",
      3: "Comunica-se com clareza e ouve os colegas e líderes.",
      4: "Comunica-se com clareza mesmo sob pressão e ajuda a alinhar o time.",
      5: "É referência em comunicação, transmitindo informações com clareza mesmo em situações difíceis.",
    },
  },
  "Organização e disciplina": {
    definicao: "Manter a área de trabalho organizada e seguir os padrões e procedimentos definidos pela empresa.",
    notas: {
      1: "Não segue os padrões e mantém a área desorganizada com frequência.",
      2: "Segue os padrões parcialmente e precisa de cobrança constante.",
      3: "Segue os padrões e mantém a área organizada na maior parte do tempo.",
      4: "Mantém a organização e o padrão mesmo em momentos de alta demanda.",
      5: "É referência em organização e disciplina, e ajuda a manter o padrão de todo o time.",
    },
  },
  "Proatividade": {
    definicao: "Identificar o que precisa ser feito sem esperar ser mandado(a), propor melhorias e agir diante de problemas.",
    notas: {
      1: "Só faz o que é determinado e não se antecipa a nada.",
      2: "Às vezes toma iniciativa, mas depende de orientação na maioria das situações.",
      3: "Identifica o que precisa ser feito e age sem precisar ser cobrado(a).",
      4: "Se antecipa a problemas e sugere melhorias com frequência.",
      5: "É exemplo de iniciativa: antecipa problemas e propõe soluções que beneficiam toda a equipe.",
    },
  },
};

export const DESCRICOES_TECNICAS: Record<string, Record<string, { definicao: string; notas: Record<number, string> }>> = {
  "Atendente": {
    "Conhecimento do cardápio": {
      definicao: "Conhece os itens do cardápio, ingredientes, combinações e promoções vigentes.",
      notas: { 1: "Não conhece o cardápio e não consegue orientar o cliente.", 2: "Conhece parcialmente, comete erros em itens ou preços.", 3: "Conhece o cardápio e explica os itens com segurança.", 4: "Conhece bem, identifica alergênicos e sugere combinações.", 5: "Domina completamente e atualiza-se sobre promoções e novidades." },
    },
    "Qualidade do atendimento": {
      definicao: "Atende o cliente com cordialidade, atenção e cuidado, criando uma boa experiência.",
      notas: { 1: "Atendimento inadequado, sem atenção ao cliente.", 2: "Atendimento básico, sem cuidado com a experiência.", 3: "Atende com cordialidade e mantém postura profissional.", 4: "Faz sugestões e cria experiência positiva ao cliente.", 5: "Referência em atendimento, elogiado pelos clientes." },
    },
    "Registro correto dos pedidos": {
      definicao: "Lança os pedidos no sistema sem erros, evitando retrabalho e prejuízo.",
      notas: { 1: "Comete erros frequentes nos pedidos.", 2: "Comete erros ocasionais que geram retrabalho.", 3: "Registra corretamente e confere antes de finalizar.", 4: "Raramente erra e registra observações corretamente.", 5: "Zero erros, referência em precisão de lançamento." },
    },
    "Agilidade no atendimento": {
      definicao: "Atende com rapidez sem perder a qualidade, respeitando o tempo do cliente.",
      notas: { 1: "Lento(a), gera filas e insatisfação.", 2: "Abaixo do tempo esperado com frequência.", 3: "Atende dentro do tempo esperado.", 4: "Atende com agilidade mesmo em horários de pico.", 5: "Referência em velocidade sem perder qualidade." },
    },
    "Resolução de problemas com clientes": {
      definicao: "Lida com reclamações e imprevistos de forma equilibrada, buscando solução.",
      notas: { 1: "Não consegue lidar com reclamações, piora a situação.", 2: "Resolve apenas situações simples, escalona sem tentar.", 3: "Mantém a calma e busca resolver antes de escalar.", 4: "Resolve a maioria dos problemas com autonomia e equilíbrio.", 5: "Referência em resolução, transforma problemas em fidelização." },
    },
  },
  "Delivery": {
    "Conferência dos pedidos": {
      definicao: "Confere itens, quantidades e observações antes de despachar o pedido.",
      notas: { 1: "Não confere, gera erros frequentes.", 2: "Confere parcialmente, ainda erra.", 3: "Confere itens e quantidades antes de despachar.", 4: "Confere com atenção a detalhes e observações especiais.", 5: "Zero erros de conferência, referência na equipe." },
    },
    "Utilização dos sistemas de delivery": {
      definicao: "Usa corretamente os aplicativos e sistemas de delivery.",
      notas: { 1: "Não domina os sistemas, gera erros.", 2: "Usa com dificuldade, comete erros com frequência.", 3: "Usa corretamente e atualiza status em tempo real.", 4: "Domina todos os sistemas e orienta colegas.", 5: "Referência no uso dos sistemas, sem erros." },
    },
    "Agilidade no despacho": {
      definicao: "Despacha os pedidos dentro do tempo estabelecido, evitando atrasos.",
      notas: { 1: "Despacha com atrasos frequentes.", 2: "Atrasos ocasionais.", 3: "Despacha dentro do tempo esperado.", 4: "Mantém agilidade em horários de pico.", 5: "Referência em tempo de despacho." },
    },
    "Organização da expedição": {
      definicao: "Mantém a área de expedição organizada e os pedidos identificados corretamente.",
      notas: { 1: "Área desorganizada, pedidos misturados.", 2: "Organização parcial, erros de identificação.", 3: "Área organizada e pedidos identificados.", 4: "Organização impecável mesmo em pico.", 5: "Referência em organização da expedição." },
    },
    "Tratativa de ocorrências": {
      definicao: "Lida bem com problemas como pedido errado, atraso ou reclamação do cliente.",
      notas: { 1: "Não sabe lidar com ocorrências.", 2: "Resolve apenas situações simples.", 3: "Comunica o problema e busca solução rápida.", 4: "Resolve com autonomia e registra corretamente.", 5: "Referência em tratativa, minimiza impacto ao cliente." },
    },
  },
  "Auxiliar de Cozinha": {
    "Higiene e segurança alimentar": {
      definicao: "Segue as boas práticas de higiene pessoal, dos alimentos e do ambiente.",
      notas: { 1: "Não segue práticas de higiene, risco sanitário.", 2: "Segue parcialmente, com falhas frequentes.", 3: "Segue as práticas de higiene corretamente.", 4: "Segue rigorosamente e alerta colegas sobre falhas.", 5: "Referência em higiene, nunca apresenta desvios." },
    },
    "Pré-preparo": {
      definicao: "Realiza cortes, porcionamentos e preparações iniciais conforme o padrão.",
      notas: { 1: "Não segue as fichas, padrão fora do esperado.", 2: "Segue parcialmente, com inconsistências.", 3: "Segue as fichas e mantém o padrão de corte.", 4: "Padronizado e ágil no pré-preparo.", 5: "Referência em precisão e velocidade." },
    },
    "Organização da praça": {
      definicao: "Mantém sua estação de trabalho limpa, organizada e abastecida.",
      notas: { 1: "Praça desorganizada e sem mise en place.", 2: "Organização parcial, precisa de cobrança.", 3: "Mantém mise en place e limpeza durante o serviço.", 4: "Praça sempre pronta mesmo em alta demanda.", 5: "Referência em organização, ajuda a equipe." },
    },
    "Armazenamento de insumos": {
      definicao: "Guarda os insumos de forma correta, respeitando temperatura, validade e identificação.",
      notas: { 1: "Não etiqueta, não respeita validade.", 2: "Armazena com falhas frequentes.", 3: "Etiqueta e respeita PVPS e temperatura.", 4: "Organizado e atento a vencimentos.", 5: "Referência em controle de estoque e armazenamento." },
    },
    "Controle de desperdício": {
      definicao: "Evita desperdício de insumos no manuseio e no preparo.",
      notas: { 1: "Desperdiça com frequência, sem atenção.", 2: "Desperdício acima do esperado.", 3: "Aproveitamento adequado dos insumos.", 4: "Minimiza desperdício e sugere reaproveitamentos.", 5: "Referência em controle, praticamente zero desperdício." },
    },
  },
  "Cozinheiro(a)": {
    "Execução das fichas técnicas": {
      definicao: "Prepara os pratos seguindo rigorosamente as fichas técnicas.",
      notas: { 1: "Não segue as fichas, produto inconsistente.", 2: "Segue parcialmente, com desvios.", 3: "Segue as fichas com padronização.", 4: "Padronizado e consistente em alta demanda.", 5: "Referência em execução, nunca desvia das fichas." },
    },
    "Qualidade dos produtos": {
      definicao: "Entrega pratos com sabor, ponto de cozimento e apresentação consistentes.",
      notas: { 1: "Produtos fora do padrão com frequência.", 2: "Qualidade inconsistente.", 3: "Padrão visual e sabor consistentes.", 4: "Alta qualidade, raramente apresenta desvios.", 5: "Referência em qualidade, elogiado pelos clientes." },
    },
    "Produtividade": {
      definicao: "Produz dentro do tempo esperado sem comprometer a qualidade.",
      notas: { 1: "Lento(a), gera atrasos na cozinha.", 2: "Abaixo do ritmo esperado.", 3: "Produz dentro do tempo esperado.", 4: "Sustenta o ritmo em horários de pico.", 5: "Referência em velocidade e qualidade simultâneas." },
    },
    "Organização da estação de trabalho": {
      definicao: "Mantém sua área organizada, com insumos e utensílios no lugar certo.",
      notas: { 1: "Área desorganizada, mise en place ausente.", 2: "Organização parcial.", 3: "Mantém mise en place e limpeza contínua.", 4: "Organizado mesmo em alta demanda.", 5: "Referência em organização da estação." },
    },
    "Controle de desperdício": {
      definicao: "Usa os insumos de forma consciente, evitando perdas e prejuízo.",
      notas: { 1: "Desperdício alto e frequente.", 2: "Acima do esperado.", 3: "Porcionamento correto e aproveitamento adequado.", 4: "Minimiza perdas ativamente.", 5: "Referência, praticamente zero desperdício." },
    },
  },
  "Líder": {
    "Gestão da equipe": {
      definicao: "Organiza escalas, distribui tarefas e garante que a equipe funcione bem no dia a dia.",
      notas: { 1: "Equipe desorganizada, clima ruim.", 2: "Gestão básica, com lacunas frequentes.", 3: "Equipe organizada e funcionando bem.", 4: "Distribui tarefas com equidade e antecipação.", 5: "Referência em gestão, equipe de alta performance." },
    },
    "Cumprimento dos padrões operacionais": {
      definicao: "Garante que os processos e padrões da operação sejam seguidos por toda a equipe.",
      notas: { 1: "Padrões frequentemente descumpridos.", 2: "Cumprimento parcial, necessita cobrança.", 3: "Padrões seguidos pela equipe.", 4: "Alta aderência mesmo sob pressão.", 5: "Referência em padrões, resultado de auditorias excelente." },
    },
    "Desenvolvimento dos colaboradores": {
      definicao: "Orienta, treina e dá feedback contínuo à equipe.",
      notas: { 1: "Não dá feedback nem orienta a equipe.", 2: "Feedback raro ou superficial.", 3: "Dá feedback e acompanha o desenvolvimento.", 4: "Feedback frequente e PDIs acompanhados.", 5: "Referência em desenvolvimento, equipe em constante evolução." },
    },
    "Resolução de problemas": {
      definicao: "Identifica e resolve problemas operacionais com agilidade e bom senso.",
      notas: { 1: "Demora ou evita resolver problemas.", 2: "Resolve apenas situações simples.", 3: "Resolve com agilidade e bom senso.", 4: "Antecipa problemas antes que ocorram.", 5: "Referência em resolução, raramente escalona." },
    },
    "Gestão de indicadores": {
      definicao: "Acompanha e age sobre os indicadores da unidade.",
      notas: { 1: "Não conhece os indicadores da unidade.", 2: "Conhece mas não age sobre eles.", 3: "Acompanha e toma ações baseadas nos dados.", 4: "Usa indicadores para antecipar problemas.", 5: "Referência em gestão por dados." },
    },
  },
  "Supervisor(a)": {
    "Desenvolvimento de líderes": {
      definicao: "Forma e desenvolve os líderes das unidades sob sua responsabilidade.",
      notas: { 1: "Não investe no desenvolvimento de líderes.", 2: "Desenvolvimento pontual, sem consistência.", 3: "Acompanha PDIs e desenvolve líderes regularmente.", 4: "Líderes com alta autonomia e evolução visível.", 5: "Referência em formação de liderança." },
    },
    "Gestão operacional": {
      definicao: "Garante o funcionamento das unidades dentro do padrão da rede.",
      notas: { 1: "Unidades fora do padrão constantemente.", 2: "Padrão inconsistente entre unidades.", 3: "Unidades dentro do padrão da rede.", 4: "Padronização elevada, gaps resolvidos rapidamente.", 5: "Referência em gestão operacional multiunit." },
    },
    "Gestão de indicadores": {
      definicao: "Acompanha os indicadores de todas as unidades sob sua gestão.",
      notas: { 1: "Não acompanha indicadores.", 2: "Acompanha superficialmente.", 3: "Usa dados para tomar decisões.", 4: "Antecipa problemas com base em dados.", 5: "Referência em gestão por indicadores." },
    },
    "Melhoria contínua": {
      definicao: "Propõe e implementa melhorias nos processos das unidades.",
      notas: { 1: "Não propõe melhorias.", 2: "Propostas raras e sem implementação.", 3: "Propõe e implementa melhorias regularmente.", 4: "Melhorias com impacto mensurável.", 5: "Referência em inovação e melhoria de processos." },
    },
    "Entrega de resultados": {
      definicao: "Garante que as metas das unidades sejam atingidas de forma sustentável.",
      notas: { 1: "Metas raramente atingidas.", 2: "Atingimento inconsistente.", 3: "Metas atingidas consistentemente.", 4: "Supera metas sem comprometer a equipe.", 5: "Referência em entrega de resultados." },
    },
  },
  "Analista Administrativo": {
    "Gestão de estoque": {
      definicao: "Controla entradas, saídas e níveis de estoque de forma precisa e organizada.",
      notas: { 1: "Estoque descontrolado, sem registros.", 2: "Controle parcial, com erros frequentes.", 3: "Estoque controlado e registros atualizados.", 4: "Controle preciso com alertas de reposição.", 5: "Referência em gestão de estoque, zero divergências." },
    },
    "Processo de compras": {
      definicao: "Conduz cotações, pedidos e acompanhamento de fornecedores com eficiência.",
      notas: { 1: "Compras sem processo definido.", 2: "Processo básico com falhas.", 3: "Cotações e pedidos dentro do fluxo esperado.", 4: "Otimiza compras e negocia melhores condições.", 5: "Referência em compras, reduz custos consistentemente." },
    },
    "Controle de custos": {
      definicao: "Monitora despesas e identifica oportunidades de redução de custos.",
      notas: { 1: "Não acompanha custos.", 2: "Acompanha superficialmente.", 3: "Monitora e reporta desvios.", 4: "Identifica e age sobre oportunidades de redução.", 5: "Referência em controle, propõe melhorias de forma proativa." },
    },
    "Organização de documentos e registros": {
      definicao: "Mantém arquivos, registros e documentos organizados e atualizados.",
      notas: { 1: "Documentos desorganizados e desatualizados.", 2: "Organização parcial.", 3: "Documentos organizados e acessíveis.", 4: "Sistematizado, fácil localização e auditoria.", 5: "Referência em gestão documental." },
    },
    "Relacionamento com fornecedores": {
      definicao: "Mantém relacionamento profissional e produtivo com fornecedores.",
      notas: { 1: "Relacionamento conflituoso ou inexistente.", 2: "Relação básica, sem proatividade.", 3: "Relacionamento profissional e cordial.", 4: "Parceria ativa, negocia bem condições.", 5: "Referência em relacionamento, gera vantagens para a empresa." },
    },
  },
  "Auxiliar Administrativo": {
    "Organização de documentos": {
      definicao: "Mantém arquivos e documentos organizados e de fácil acesso.",
      notas: { 1: "Documentos desorganizados, difícil localização.", 2: "Organização parcial.", 3: "Documentos organizados e acessíveis.", 4: "Sistema eficiente e sempre atualizado.", 5: "Referência em organização documental." },
    },
    "Apoio em processos administrativos": {
      definicao: "Apoia as rotinas administrativas com precisão e pontualidade.",
      notas: { 1: "Não conclui tarefas sem supervisão constante.", 2: "Conclui com erros ou atrasos frequentes.", 3: "Apoia processos com precisão e pontualidade.", 4: "Apoia com autonomia e antecipa demandas.", 5: "Referência em apoio administrativo." },
    },
    "Comunicação interna": {
      definicao: "Comunica informações de forma clara e no tempo certo para as áreas envolvidas.",
      notas: { 1: "Comunicação falha, gera retrabalho.", 2: "Comunicação inconsistente.", 3: "Comunica com clareza e no tempo certo.", 4: "Proativo na comunicação, evita falhas.", 5: "Referência em comunicação interna." },
    },
    "Cumprimento de prazos": {
      definicao: "Entrega tarefas dentro dos prazos estabelecidos.",
      notas: { 1: "Frequentemente atrasa entregas.", 2: "Atrasos ocasionais.", 3: "Cumpre prazos consistentemente.", 4: "Entrega antes do prazo quando possível.", 5: "Referência em pontualidade, nunca atrasa." },
    },
    "Qualidade e precisão das tarefas": {
      definicao: "Executa tarefas com atenção aos detalhes e sem erros.",
      notas: { 1: "Erros frequentes nas tarefas.", 2: "Erros ocasionais.", 3: "Tarefas executadas com precisão.", 4: "Alta precisão, raramente necessita correção.", 5: "Referência em qualidade, zero retrabalho." },
    },
  },
};

export const PERGUNTAS_COLABORADOR = [
  "Quais foram suas principais conquistas neste período?",
  "Em que situações você se sentiu mais confiante no seu trabalho?",
  "Quais foram os maiores desafios ou dificuldades que você enfrentou?",
  "O que você gostaria de desenvolver ou aprender nos próximos meses?",
  "Existe algo no dia a dia (processo, ferramenta ou relacionamento) que dificulta o seu trabalho?",
  "Como você avalia sua evolução desde a última avaliação?",
  "O que você espera do seu líder para te apoiar no seu desenvolvimento?",
];

export const PERGUNTAS_LIDER = [
  "Quais foram as principais entregas e conquistas do colaborador neste período?",
  "Em quais situações o colaborador se destacou positivamente?",
  "Quais comportamentos ou entregas ainda precisam de mais atenção?",
  "Quais oportunidades de desenvolvimento você identifica para esse colaborador?",
  "O colaborador está preparado para assumir mais responsabilidades? Por quê?",
  "Como você, como líder, pode apoiar o desenvolvimento desse colaborador nos próximos meses?",
  "Existe algum risco de desmotivação ou desligamento que você observa? O que pode ser feito?",
];

export const COMPETENCIAS_TECNICAS: Record<string, string[]> = {
  Atendente: [
    "Conhecimento do cardápio",
    "Qualidade do atendimento",
    "Registro correto dos pedidos",
    "Agilidade no atendimento",
    "Resolução de problemas com clientes",
  ],
  "Auxiliar de Cozinha": [
    "Higiene e segurança alimentar",
    "Pré-preparo",
    "Organização da praça",
    "Armazenamento de insumos",
    "Controle de desperdício",
  ],
  "Cozinheiro(a)": [
    "Execução das fichas técnicas",
    "Qualidade dos produtos",
    "Produtividade",
    "Organização da estação de trabalho",
    "Controle de desperdício",
  ],
  Delivery: [
    "Conferência dos pedidos",
    "Utilização dos sistemas de delivery",
    "Agilidade no despacho",
    "Organização da expedição",
    "Tratativa de ocorrências",
  ],
  Líder: [
    "Gestão da equipe",
    "Cumprimento dos padrões operacionais",
    "Desenvolvimento dos colaboradores",
    "Resolução de problemas",
    "Gestão de indicadores",
  ],
  "Supervisor(a)": [
    "Desenvolvimento de líderes",
    "Gestão operacional",
    "Gestão de indicadores",
    "Melhoria contínua",
    "Entrega de resultados",
  ],
  "Analista Administrativo": [
    "Gestão de estoque",
    "Processo de compras",
    "Controle de custos",
    "Organização de documentos e registros",
    "Relacionamento com fornecedores",
  ],
  "Auxiliar Administrativo": [
    "Organização de documentos",
    "Apoio em processos administrativos",
    "Comunicação interna",
    "Cumprimento de prazos",
    "Qualidade e precisão das tarefas",
  ],
};

export const CARGOS = Object.keys(COMPETENCIAS_TECNICAS);
