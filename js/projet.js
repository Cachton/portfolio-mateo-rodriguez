import { chargerProjets } from './data.js';

const contenu = document.querySelector('.page-projet');
const identifiant = new URLSearchParams(window.location.search).get('id');

function afficherProjet(projet) {
    document.title = `${projet.titre} | Mateo Rodriguez Fontaine`;

    const article = document.createElement('article');
    const titre = document.createElement('h1');
    const image = document.createElement('img');
    const texte = document.createElement('p');

    article.className = 'page-projet__article';
    titre.textContent = projet.titre;
    image.src = projet.image;
    image.alt = projet.alt;
    texte.textContent = projet.description || 'Aucune description pour ce projet.';

    article.append(titre, image);

    if (projet.categorie) {
        const categorie = document.createElement('p');
        categorie.className = 'page-projet__categorie';
        categorie.textContent = projet.categorie;
        article.append(categorie);
    }

    article.append(texte);
    contenu.replaceChildren(article);
}

async function initialiserProjet() {
    try {
        const projets = await chargerProjets();
        const projet = projets.find((element) => element.identifiant === identifiant);

        if (!projet) {
            throw new Error('Projet introuvable.');
        }

        afficherProjet(projet);
    } catch (erreur) {
        contenu.textContent = 'Ce projet est introuvable ou temporairement indisponible.';
        console.error(erreur);
    }
}

initialiserProjet();
