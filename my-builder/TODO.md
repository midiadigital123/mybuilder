# O que ainda falta fazer?
-> Preciso estruturar o sistema de build usando SASS.
    -> Para efetuar a build, preciso montar um arquivo CSS completo da forma que eu preciso para funcionar na plataforma.
    -> Preciso ver quais variáveis vão ficar e quais podem ser removidas.
    -> Preciso definir a lista de componentes e separar CSS, JS e HTML de cada um.
    -> Preciso criar a função do backend que monta a estrutura e cria as pastas finais para inserir os arquivos buildados.



# O que precisa melhorar?
-> Preciso melhorar a nomeação dos elementos(principalmente botões clicáveis). Centralizar a lógica é necessário.
-> Preciso melhora a organização e ordem das execuções.

-> Quando o usuário desativa um componente, o sistema deve verificar se há outro ativo, e se houver, deverá aplicar o valor true ao atributo active-view desse componente.



# O que preciso pensar?
-> Preciso pensar se há necessidade da pasta custom com os códigos de cada componente separados, ou se é preferível ter apenas o arquivo de build e em uma eventual mudança acabamos por mudar nele.
    > Qual a necessidade dos códigos duplicados?
    > A que serve os códigos separados a pasta custom uma vez que eles não serão chamados separadamente no moodle
    Deixar a pasta custom vai me obrigar a fazer um sistema para rebuild. Eliminá-los vai garantir que não seja necessário buildar de novo.
    
    A esse ponto, loader e manifest não serão mais necessários, pois o trabalho que eu tinha preenchendo eles será o mesmo que preencher tudo na interface electron.

    

-> Preciso pensar como vou alimentar o front com os componentes aceitos bem como as versões de cada um deles.
    Será que fazendo consultas ao nosso fileZilla? Será que eu consigo listar pastas? Ou tenho que bater na url e ver o retorno.

-> Preciso pensar como será a build do JS. Acredito que como eu estarei revendo todos os códigos, conseguirei eliminar alguma parte que quebre.

-> Como vou verificar o ambiente de execução? Pensei aqui que se eu remover os arquivos de componentes separados, por um lado eu resolvo a necessidade de uma build nova a cada modificação, mas por outro lado eu impeço que, no contrutor de aulas o bernard seja capaz de mudar a versão do componente. Passaremos a então lidar com a ideia de identidades de novo. Engessa um pouco, mas eu acredito que o fato de termos uma visualização dos componentes na criação do curso satisfaça essa vontade de "ver como fica" e até mesmo personalizar.

-> O que fazer com a tipografia? Ela vai se tornar um componente no electron app? Ou eu simplesmente vou considerar o padrão que temos? Qual dá menos trabalho?
    -> Posso considerar que 'layout', 'tipografia' farão parte dos componentes mas que eles não poderão ser desativados.

    -> Pensei em fazer para a tipografia a configuração de tamanhos pela interface e não pelo código, mas acho que isso é uma perda de tempo, visto que todo o resto é feito via código. 

LIB de Highlight: https://highlightjs.org/


----

* Partes do sistema *

-> Iniciou a criação do curso: cria um json ou objeto js temporário para armazenar os valores digitados.

-> Sidebar para acompanhamento dos passos

-> O json/objeto é atualizado sempre mudar de um passo para outro, assim eu garanto que vou atualizar sempre, mesmo se o usuário voltar em um passo, depois ir para um próximo.

-> Eu posso separar em 4 módulos(seções), po, tranquilamente. Se mais um passo for inserido é só mais um módulo. Cada módulo vai ter os scripts associados aos componentes daquela seção. 