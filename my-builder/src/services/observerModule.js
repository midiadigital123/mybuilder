// src/services/observerModule.js

// Um observador observa um "canal" e notifica os inscritos quando algo muda nesse canal.

class ObserverModule {
  constructor() {
    // Usamos um Map para associar um "canal" a uma lista de "observadores" (funções)
    this.observers = new Map();
  }

  /**
   * Registra um observador para um canal.
   * @param {string|HTMLElement} channel - O identificador do que será observado.
   * @param {Function} callback - A função a ser executada quando o canal mudar.
   */
  subscribeTo(channel, callback) {
    // Quem chama subscribeTo quer ser notificado quando algo mudar no "channel"
    if (!this.observers.has(channel)) {
      this.observers.set(channel, []);
    }
    this.observers.get(channel).push(callback);
  }

  /**
   * Notifica todos os observadores de um canal sobre uma mudança.
   * @param {string|HTMLElement} channel - O canal que mudou.
   * @param {*} data - Dados opcionais sobre a mudança.
   */
  sendNotify(channel, data) {
    const callbacks = this.observers.get(channel);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  /**
   * Remove um observador específico.
   * Importante para evitar memory leaks!
   */
  unsubscribeTo(channel, callbackToRemove) {
    if (!this.observers.has(channel)) return;
    
    const callbacks = this.observers.get(channel);
    const newCallbacks = callbacks.filter(callback => callback !== callbackToRemove);
    
    if (newCallbacks.length === 0) {
      this.observers.delete(channel);
    } else {
      this.observers.set(channel, newCallbacks);
    }
  }
}


// Exportamos uma única instância (Singleton) para ser usada em toda a app
export default new ObserverModule();

