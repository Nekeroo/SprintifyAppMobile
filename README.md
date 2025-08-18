# Sprintify 

Ce projet est l'application frontend de l'application Sprintify. Celle-ci permet de visualiser les projets, les sprints et les tâches associées. De plus, il y a une authentification utilisateur grâce à l'application Backend retrouvable ici : 

https://github.com/Nekeroo/Sprintify

## Dernière version stable (LTS)

La dernière version stable est la version 1.7.1.
https://github.com/Nekeroo/SprintifyAppMobile/tree/1.7.1

## Prérequis 

- Node (version utilisée : [v22.18.0](https://nodejs.org/en/blog/release/v22.18.0))
- Expo (version utlisée : [v53.0.20](https://www.npmjs.com/package/expo/v/53.0.20?activeTab=versions))
- React Native (version utilisée : [v0.79.5](https://www.npmjs.com/package/react-native/v/0.79.5?activeTab=versions))
- VSCode ou WebStorm selon vos préférences

## Installation 

### Cloner le projet 

```bash
git clone https://github.com/Nekeroo/SprintifyAppMobile.git
```

### Installer les dépendances 

```bash
npm install
```

### Lancer l'application 

Pour lancer l'application il y a différentes scripts de lancement présent dans le package.json : 

```text
"scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "test": "jest --watchAll"
}
```

```bash
npm run start
```

## Structure du projet 

* app : dossier contenant les pages de l'application (*Ex : index, profile, project, sprint, task*)
* assets : dossier contenant les assets de l'application (*Ex : images, fonts*)
* config : dossier contenant la configuration de l'application (*Ex : API_CONFIG*)
* services : dossier contenant les services de l'application (*Ex : authService, userService, projectService*)
* store : dossier contenant le store de l'application (*Ex : authSlice, projectSlice*)
* styles : dossier contenant les styles de l'application (*Ex : theme*)
* types : dossier contenant les objets de l'application (*Ex : auth, project, sprint, task*)

## Fonctionnalités principales 

* Lecture, Création et Suppression de projets
* Lecture, Création et Suppression de sprints
* Lecture, Création, Modification et Suppression de tâches
* Authentification utilisateur
* Recherche d'utilisateurs pour l'assignation
* Visualiser les statistiques "principales" d'un sprint
