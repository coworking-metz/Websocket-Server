### Fonctionnement

Ce projet implémente un serveur WebSocket utilisant Node.js, la bibliothèque `ws` pour la gestion des WebSockets, et Redis pour le stockage des données des clients. Ce serveur permet la communication en temps réel entre les clients connectés selon des actions spécifiques. Le serveur Websocket permet de forwarder tous les messages qui lui sont envoyés par un client donné à tous les autres clients connectés ayant la même `action`. 

#### Catégorisation des Clients et des Messages par Action

Le serveur est configuré pour traiter les connexions WebSocket de manière à catégoriser les clients et leurs messages selon des `action` spécifiées lors de la connexion. Chaque client, lors de son premier message, doit envoyer des informations d'enregistrement incluant une clé nommée `action`. Cette `action` détermine la catégorie à laquelle le client appartient et influence la façon dont les messages sont routés et gérés par le serveur.

1. **Initialisation et Connexion :**
   - À la connexion, le client envoie un message contenant son `action`.
   - Le serveur vérifie la présence de cette clé `action`. Si elle est absente, le client reçoit un message d'erreur et est déconnecté pour manque d'informations nécessaires à l'enregistrement.

2. **Enregistrement et Stockage des Actions :**
   - Si le message contient l'`action` requise, le serveur génère un identifiant unique pour le client et associe cet identifiant à l'`action` dans une base de données Redis. Cette association permet de récupérer rapidement tous les clients liés à une action spécifique.

3. **Gestion et Routage des Messages :**
   - Lorsque des messages supplémentaires sont reçus d'un client, le serveur les traite en extrayant leur contenu JSON et en les enregistrant.
   - Ces messages sont ensuite redistribués à tous les autres clients connectés qui écoutent la même `action`. Cela permet de s'assurer que les messages sont uniquement vus par les clients pertinents, facilitant une communication ciblée basée sur des intérêts ou des fonctions spécifiques définis par l'`action`.

4. **Déconnexion et Nettoyage :**
   - Lorsqu'un client se déconnecte, son identifiant est retiré de la base de données Redis, ce qui empêche toute communication ultérieure avec ce client sous l'`action` précédemment enregistrée.

Ce modèle de fonctionnement par `action` permet de structurer la communication entre clients de manière efficace et organisée, assurant que chaque message atteint uniquement les clients concernés par une thématique ou une fonction spécifique.


#### Écoute sur le port 8080

Le serveur écoute les connexions entrantes sur le port 8080.

### Maintenance avec PM2

PM2 est un gestionnaire de processus pour applications Node.js. Il est utilisé ici pour gérer et maintenir le serveur WebSocket en production. PM2 permet de garder l'application en exécution continue et de la redémarrer automatiquement en cas de crash.


#### Maintenance du serveur avec PM2

```bash
pm2 start websocket-server
```

```bash
pm2 stop websocket-server
```

```bash
pm2 status websocket-server
```

#### Surveillance et logs

PM2 fournit des commandes pour surveiller les logs et l'état du serveur :

- `pm2 list` pour lister tous les processus.
- `pm2 logs` pour voir les logs en temps réel.
- `pm2 status` pour vérifier l'état du serveur.

#### Mise à jour et redémarrage

Pour mettre à jour le code du serveur et le redémarrer sans temps d'arrêt, utilisez :

```bash
pm2 reload websocket-server
```
