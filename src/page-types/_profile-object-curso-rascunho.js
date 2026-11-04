// Rascunhos que estavam comentados no sitemap original. O prefixo "_" deixa este arquivo fora do bundle.

// var profileObjectCursoPageType = {
//
//     name: "Profile Object Curso",
//
//     isMatch: () => /\/aluno\/curso\/video\/codigo\//.test(
//         window.location.pathname
//     ),
//
//     interaction: {
//         name: "Profile Object Curso"
//     },
//
//     onActionEvent: (event) => {
//
//         const txt = (el) => el
//             ? el.textContent.replace(/\s+/g, ' ').trim()
//             : null;
//
//         const decode = (s) => {
//             try {
//                 return decodeURIComponent(s);
//             } catch (e) {
//                 return s;
//             }
//         };
//
//         // Identificadores da URL
//         const match = window.location.pathname.match(
//             /\/codigo\/([^/]+)\/(?:c|v)\/([^/]+)/
//         );
//
//         const cursoCodigo = match ? decode(match[1]) : null;
//         const aulaCodigoUrl = match ? decode(match[2]) : null;
//
//         // Código e professor
//         const paragrafos = [...document.querySelectorAll('p')];
//
//         const codigoTexto = paragrafos
//             .map(txt)
//             .find(p => /código:\s*\d+/i.test(p || '')) || '';
//
//         const codigoAula = (
//             codigoTexto.match(/código:\s*(\d+)/i) || []
//         )[1] || null;
//
//         const professor = (
//             codigoTexto.match(/Professor\(a\):\s*(.+)$/i) || []
//         )[1] || null;
//
//         // Informações de disciplina e tópico
//         const afterLabel = (label) => {
//
//             const el = [...document.querySelectorAll('*')].find(
//                 e => e.children.length === 0 &&
//                     (txt(e) || '').toLowerCase() === label.toLowerCase()
//             );
//
//             const next = el?.nextElementSibling ||
//                 el?.parentElement?.nextElementSibling;
//
//             return txt(next);
//         };
//
//         const disciplina = afterLabel('DISCIPLINA');
//         const topico = afterLabel('TÓPICO');
//
//         // Links da página
//         const links = [...document.querySelectorAll('a[href]')]
//             .map(a => a.href);
//
//         // Percentual de conclusão
//         let pctDisciplina = null;
//
//         document.querySelectorAll('li, button, a, div').forEach(el => {
//
//             if (pctDisciplina !== null || el.children.length > 6) {
//                 return;
//             }
//
//             const m = (txt(el) || '').match(
//                 /^(.{3,60}?)\s*(\d{1,3})%\s*concluído$/
//             );
//
//             if (m && m[1].trim() === disciplina) {
//                 pctDisciplina = Number(m[2]);
//             }
//         });
//
//         // Total de aulas
//         const totalAulas = [...document.querySelectorAll('h4')]
//             .filter(h => /^\d+\s*-\s*/.test(txt(h) || ''))
//             .length;
//
//         // Atributos do Profile Object
//         const attrs = {
//
//             cursoCodigo: cursoCodigo,
//             aulaCodigoUrl: aulaCodigoUrl,
//
//             url: window.location.href,
//
//             alunoNome: 'teste',
//
//             cursoNome: txt(
//                 document.querySelector('h1')
//             ),
//
//             aulaTitulo: txt(
//                 document.querySelector('h2')
//             ),
//
//             aulaCodigo: codigoAula,
//             professor: professor,
//
//             disciplina: disciplina,
//             topico: topico,
//
//             pctDisciplina: pctDisciplina,
//             totalAulasDisciplina: totalAulas,
//
//             degravacaoUrl:
//                 links.find(h => /download-resumo/.test(h)) || null,
//
//             cadernoQuestoesUrl:
//                 links.find(h =>
//                     /questoes\.grancursosonline/.test(h)
//                 ) || null,
//
//             acessoGratuito: /gratuito/i.test(
//                 txt(document.querySelector('h1')) || ''
//             )
//         };
//
//         // Não cria registros sem código de curso
//         if (!cursoCodigo) {
//             console.warn(
//                 "Profile Object Curso: código do curso não encontrado."
//             );
//
//             return event;
//         }
//
//         // Preserva usuário e identidades
//         event.user = event.user || {};
//
//         event.user.identities = {
//             ...event.user.identities
//         };
//
//         // Profile Object: um registro por curso
//         event.user.profileObjects = {
//             ...event.user.profileObjects,
//
//             Curso: [
//                 {
//                     id: "registro-001",
//                     attributes: {
//                         cursoCodigo: "123",
//                         cursoNome: "Curso de Teste"
//                     }
//                 }
//             ]
//         };
//
//         console.log("Profile Object Curso:", attrs);
//
//         return event;
//     }
// };


// var profileObjectCursoPageType = {
//
//     name: "Profile Object Curso",
//
//     isMatch: () => /\/aluno\/curso\/video\/codigo\//.test(
//         window.location.pathname
//     ),
//
//     interaction: {
//         name: "Profile Object Curso"
//     },
//
//     onActionEvent: (event) => {
//
//         event.user = event.user || {};
//
//         event.user.identities = {
//             ...event.user.identities
//         };
//
//         event.user.profileObjects = {
//             ...event.user.profileObjects,
//
//             Curso: [
//                 {
//                     id: "registro-001",
//                     attributes: {
//                         cursoCodigo: "123",
//                         cursoNome: "Curso de Teste"
//                     }
//                 }
//             ]
//         };
//
//         console.log("EVENTO CURSO:", event);
//
//         return event;
//     }
// };
