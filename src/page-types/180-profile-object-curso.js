export default {
    name: "Profile Object Curso",

    isMatch: () => /\/aluno\/curso\/video\/codigo\/.+\/c\//.test(window.location.pathname),

    interaction: {
        name: "Profile Object Curso"
    },

    onActionEvent: (event) => {

        // Agenda o envio uma única vez por aula (evita loop, já que o sendEvent também passa por aqui)
        if (window.__profileObjectCursoUrl !== window.location.pathname) {
            window.__profileObjectCursoUrl = window.location.pathname;

                // Nome do aluno
                const alunoNome = SalesforceInteractions.cashDom(
                    '[data-testid="ava-nome-aluno-logado"]'
                ).first().text().trim();

                // Nome do curso
                const cursoNome = SalesforceInteractions.cashDom(
                    'h1'
                ).first().text().trim();

                // Título da aula
                const aulaTitulo = SalesforceInteractions.cashDom(
                    'h2'
                ).first().text().trim();

                // "(código: 394992) | Professor(a): Elias Santana"
                const codTxt = SalesforceInteractions.cashDom('p').filter(
                    (i, el) => /código:\s*\d+/i.test(SalesforceInteractions.cashDom(el).text())
                ).first().text().trim();
                const aulaCodigo = (codTxt.match(/código:\s*(\d+)/i) || [])[1] || "";
                const professor = (codTxt.match(/Professor\(a\):\s*(.+)$/i) || [])[1] || "";

                // Texto logo após o rótulo (disciplina / tópico)
                const afterLabel = (label) => {
                    const el = SalesforceInteractions.cashDom('div').filter(
                        (i, d) => SalesforceInteractions.cashDom(d).children().length === 0 &&
                            SalesforceInteractions.cashDom(d).text().trim().toLowerCase() === label
                    ).first();
                    return el.length ? el.next().text().trim() : "";
                };

                const disciplina = afterLabel('disciplina');
                const topico = afterLabel('tópico');

                // % concluído da disciplina selecionada
                const pctMatch = SalesforceInteractions.cashDom(
                    '[aria-label^="Selecionar disciplina"][data-selected="true"]'
                ).first().text().match(/(\d{1,3})%\s*concluído/i);
                const pctDisciplina = pctMatch ? pctMatch[1] : "0";

                // Total de aulas da disciplina
                const totalAulasDisciplina = SalesforceInteractions.cashDom('h4').filter(
                    (i, h) => /^\d+\s*-\s*/.test(SalesforceInteractions.cashDom(h).text().trim())
                ).length;

                const attributes = {
                    alunoNome: alunoNome,
                    aulaCodigo: aulaCodigo,
                    aulaTitulo: aulaTitulo,
                    cursoNome: cursoNome,
                    disciplina: disciplina,
                    pctDisciplina: pctDisciplina,
                    professor: professor,
                    topico: topico,
                    totalAulasDisciplina: String(totalAulasDisciplina)
                };

                console.log("[SFMC] Profile Object Curso:", attributes);

                // Envia o Profile Object já com a página carregada
                SalesforceInteractions.sendEvent({
                    interaction: {
                        name: "Profile Object Curso - Dados"
                    },
                    user: {
                        profileObjects: {
                            Curso: [{
                                id: 1219,
                                attributes: attributes
                            }]
                        }
                    }
                });
        }

        return event;
    }
};
