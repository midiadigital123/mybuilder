1. Pois eu acredito ser mais fácil carregar o conteúdo desses arquivos no shadowDOM, atualizá-los quando o usuário fizer alguma mudança, e quando for montar o código SCSS para ser compilado. Para mim é mais fácil trabalhar com arquivos no disco do que ficar manipulando props de um objeto javascript. Tenho certeza de que quero manter assim.

## Não precisamos pensar em permitir edição com apps externos ainda. Mas confesso que não tinha pensado nisso antes. É uma boa ideia. Mas não sei se quero investir nisso agora.

2. O plano é sim carregar os dados por meio de uma API. Ela já está sendo construída pela equipe de infra da minha empresa, mas enquanto eles não me dão retorno, estou seguindo como posso.

A listagem virá totalmente do servidor. A ideia disso é que se um novo modelo for criado no servidor, o sistema já estará atualizado.

Gostei da sugestão de usarmos:

```js
// Desenvolvimento
if (DEV_MODE) {
  this.#loadMockComponents();
}

// Produção
else {
  this.#await fetch('https://api.seuservico.com/components')
    .then(comps => this.#state.components = comps);
}
```

## enquanto a Infra não me dá retorno. Acho que fica mais profissional.

3.

Modelos:

Modelo se refere a algo mais amplo. Uma mudança maior naquele componente. Por exemplo, um carrossel pode ter imagens e texto, e outro pode ter só texto. Isso são modelos diferentes.

Versões:

As versões são variações menores que os modelos. Referem-se a mudanças pequenas e sutis, e também podem servir como correção de bugs.

Essa nomeclatura e separação se dá pela quantidade de cursos que são produzidos com esses componentes. Imagine um cenário de um curso de 3 anos de duração. Faz pouquíssimo sentido mudar os componentes no meio do curso, certo? Mas faz todo sentido serem criados novas versões e modelos do mesmo componente nesse período, mas para fazerem parte de outros projetos.

Com relação às combinações que você colocou, sim, todas são possíveis. Creio que a ideia de usar nomes mais sugestivos seja interessante, mas não é o foco da minha equipe agora.

---

4. Eu pensei em usar o ShadowDOM justamente para não lidar com o caso de CSS vazando. Podemos pensar em usar outro meio se for bem justificado. Quanto às variáveis, preciso das do tema, mas são usadas para todos os componentes e não para apenas um deles. De fato, tenho componentes como o carrossel que precisarão de scripts do bootstrap, mas confesso que não testei com ele ainda para ver se haveria algum problema.

---

5. O produto final será uma pasta (zipada ou não) que iremos utilizar para subir no FTP. Basicamente hoje fazemos essa criação da pasta com as subpastas de forma totalmente manual. Ressalto que cada curso aqui na empresa possui uma pasta diferente no FTP. Meu intuito com esse sistema é desobrigar a pessoa responsável por criar um novo curso de criar essa estrutura de pasta que é igual para todos os projetos, depois buildar esses arquivos CSS e JS de cada componente de forma manual, para então colocar nessa pasta. Meu intuito é facilitar a vida de quem for fazer isso. A pasta gerada não será para subir no moodle, mas sim para subir no FileZilla.

Na build só entram os componentes ativos. Os scripts globais do bootstrap não entram pois o moodle já os carrega.

Será um arquivo css único com tudo juntinho. Será CSS puro.

No moodle subimos o css e o js buildados e ele carrega esses arquivos apenas nas páginas onde esses componentes são mostrados(dentro das aulas).

Sim, se um usuário executou alguma modificação no código do componente, esse código vai sim para a build. As cores personalizadas ficam hardcoded na definição de variáveis de cor, e os componentes usam essas variáveis.

A minha ideia é que a URL dos assets dentro da pasta seja atribuída a algumas variáveis CSS e essas por sua vez serão usadas pelos componentes que precisam dessas imagens.

---

6. Por hora não existe uma forma de salvar a persistência do projeto. Ela não é prioridade por hora.

---

7. Esses dois arquivos pertenciam a versão anterior do código. Eu dei início a modularização e refatoração, por isso eles foram comentados, pois pertenciam ao código antigo.

Se você ler o código de editMode.js, verá que eu implementei de forma muito rudimentar um editor de código. Confesso que achei sua ideia de usar de fato um editor(ou externo ou uma ferramenta como CodeMirro, Monaco e Ace) bem melhor do que eu tinha feito.

Para mais informações sobre isso, consulte os arquivos previewMode e editMode para ver o que eu tinha começado a implementar antes.

---

8. Esse X é o número da edição do projeto lá no filezilla. O responsável por subir essa pasta vai mudar para 1, 2, 3...;

---

9. A tipografia e o layout são as partes que poderiamos chamar de estruturais, visto que não é possível que uma aula vá ao ar sem as definições de tipografia ou sem as definições de layout(colunas, ajustes e etc);

Por esse motivo, penso que essas duas não poderão ser desativadas. Quando o sistema carregar, elas já deverão estar ativadas e seus arquivos devidamente criados. O usuário pode alterar o código delas, mas não poderá desativá-las.

Concordo que seria interessante a ideia de base.css, mas, aqui na equipe a tipografia é tratada como se fosse um componente, pois ela sofre alguns ajustes frequentes.

A ideia de base.css faz sentido, e é exatamente o que será gerado na build. O arquivo buildado é na verdade o mais próximo de 'base.css' do projeto.

---

10. Não considerei EventEmitter. Pensei em Redux, mas achei que seria overkill. Acredito que essa arquitetura está funcionando e tem tudo o que preciso. Manteremos assim por enquanto.

---

11. De fato, não sei se é a melhor coisa para essas Race Conditions. Nunca trabalhei com os outros que você enumerou. Podemos pensar a respeito disso.

---

13. O código será para uso de no máximo 5 pessoas. Portanto não é tão importante a ideia de internacionalização. A UI será sempre apenas em Português.

---

14. Nesse arquivo estão as definições de variáveis dos temas de cores. Mas confesso que podemos repensar isso.

---

15. Sim, ele foi testado. Os usuários adoraram.

De fato, ainda não existe undo/redo. Não é necessário guided tour, pois esse sistema é ensinado pessoalmente.

Se ele fechar sem salvar perde o progresso.

---
