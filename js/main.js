import { chargerProjets } from './data.js';

const grille = document.querySelector('.projets__grille');

function creerCarteProjet(projet) {
    const element = document.createElement('li');
    const lien = document.createElement('a');
    const image = document.createElement('img');

    element.className = 'projet';
    lien.href = `projet.html?id=${encodeURIComponent(projet.identifiant)}`;
    lien.setAttribute('aria-label', `Voir le projet ${projet.titre}`);
    image.src = projet.image;
    image.alt = projet.alt;
    image.loading = 'lazy';

    lien.append(image);
    element.append(lien);
    return element;
}

function afficherProjets(projets) {
    grille.replaceChildren();

    if (projets.length === 0) {
        grille.textContent = 'Aucun projet disponible.';
        return;
    }

    const colonnes = [
        document.createElement('ul'),
        document.createElement('ul')
    ];

    colonnes.forEach((colonne) => {
        colonne.className = 'projets__colonne';
        grille.append(colonne);
    });

    projets.forEach((projet) => {
        const indexColonne = projet.colonne === '2' ? 1 : 0;
        colonnes[indexColonne].append(creerCarteProjet(projet));
    });
}

async function initialiserPortfolio() {
    try {
        afficherProjets(await chargerProjets());
    } catch (erreur) {
        grille.textContent = 'Les projets sont temporairement indisponibles.';
        console.error(erreur);
    }
}

initialiserPortfolio();
