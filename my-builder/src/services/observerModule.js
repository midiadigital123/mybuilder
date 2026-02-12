// src/services/observerModule.js

// Um observador observa um "canal" e notifica os inscritos quando algo muda nesse canal.

class ObserverModule {
  constructor() {
    // Usamos um Map para associar um "canal" a uma lista de "observadores" (funções)
    this.observers = new Map();
    /**
     * Map() é uma estrutura de dados que armazena pares chave-valor, assim como um objeto,
     * a diferença é que as chaves em um Map podem ser de qualquer tipo (objetos, funções, etc),
     * enquanto em um objeto as chaves são sempre strings ou símbolos.
     */

    /**
     * Tome nota!
     * 
     * Seja:
    ```
       const myMap = new Map();
      
    ``` 
     * 
     * Os seguintes métodos são válidos:
     * 
     * 1) myMap.set(key, value) -> Armazena o valor através da sua chave. Esse método também pode ser usado para alterar valores já existentes no Map.
     * 
     * 2) myMap.get(key) -> Retorna o valor associado com a chave passada, ou ´undefined´ se a chave não existir.
     * 
     * 3) myMap.has(key) -> Retorna ´true´ se a chave existir no Map, e ´false´ caso não exista.
     * 
     */
  }

  /**
   * Registra um observador para um canal.
   * @param {string|HTMLElement} channel - O identificador do que será observado.
   * @param {Function} callback - A função a ser executada quando o canal mudar.
   */
  subscribeTo(channel, callback) {
    // Quem chama subscribeTo quer ser notificado quando algo mudar no "channel"
    if (!this.observers.has(channel)) {
        // Verifica se já existe um item do Map que possui aquele canal cadastrado. No caso de não existir, usa .set(channel, []) para instanciar um canal inicialmente sem nenhum callback associado.
      this.observers.set(channel, []); 
    }
    this.observers.get(channel).push(callback);
    // Nesse momento, é seguro usar this.observers.get(channel) pois já é garantido que o canal existe no Map e já encontra-se pronto para receber as funções de callback que cada inscrito definiu. Nesse caso, é possível usar .push(callback) pois o valor usado para instanciar essa chave foi exatamente ´[]´ um array vazio. 
    // ## Veja a linha 41 ## 
  }

  /**
   * Notifica todos os observadores de um canal sobre uma mudança.
   * @param {string|HTMLElement} channel - O canal que mudou.
   * @param {*} data - Dados opcionais sobre a mudança.
   */
  sendNotify(channel, data) {
    const callbacks = this.observers.get(channel);
    // Lista todas as funções de callback associadas com aquele canal, pelos próprios inscritos.
    if (callbacks) {
        /* Existindo um ou mais callback(s)[...]
        
        ---*--- (ADENDO)

        Vale ressaltar, que assim como o Subscriber, ao se inscrever para ouvir/ser informado de determinado canal deve passar o par de informações: 
        * { nomeDoCanal, 
            funçãoQueDeveSerExecutada}
        
        O emissor da notificação(Notifyer) também deve passar as informações ao inscrito correspondente em formato de par:
        * { nomeDoCanal, dadosEspecíficosDaquelePontoDaExecução }

        ---*---

        [...] itera sobre o conjunto, invocando cada uma das funções de callback passando (data) como parâmetro. 
        */
       
      callbacks.forEach(callback => callback(data));
    }
  }

  /**
   * Remove um observador específico.
   * Importante para evitar memory leaks!
   */
  unsubscribeTo(channel, callbackToRemove) {
    if (!this.observers.has(channel)) return;
    // Se o Map não tiver o canal que o chamador de unsubscribeTo passou, já exita aqui mesmo, pois não haveria como remover callbacks de um canal que não existe.
    
    const callbacks = this.observers.get(channel);
    // Obtém o array com todos os valores(funções de callback) do canal passado. 

    const newCallbacks = callbacks.filter(callback => callback !== callbackToRemove);
    // Filtra para que apenas os callbacks passados sejam removidos do canal. Isso serve para garantir que mesmo que um inscrito se desinscreva, apenas a função callback dele será removida, e não todo o conjunto. 
    
    if (newCallbacks.length === 0) {
      this.observers.delete(channel);
      // Se não houver mais nenhuma função callback associada a esse canal, ele é deletado. 
    } else {
      this.observers.set(channel, newCallbacks);
      // Para o caso de ainda existirem outras partes do código que utilizam esse canal poderem continuar usando. Vale dizer que ´.set(channel, newCallbacks)´ está explicitamente sobrescrevendo o valor original do valor associado à chave - assim como dito na linha 23 deste arquivo.
    }
  }
}

// Exportamos uma única instância (Singleton).

// O padrão Singleton garante a existência de apenas uma única instância de uma classe em toda a aplicação, oferencendo um ponto de acesso global a ela. A classe controla sua própria instanciação, impedindo que outras classes criem novas instâncias. 

export default new ObserverModule();


