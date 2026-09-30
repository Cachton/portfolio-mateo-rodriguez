function creerIdentifiant(titre) {
    return titre
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function normaliserProjets(projets) {
    return projets.map((projet) => ({
        ...projet,
        identifiant: projet.identifiant || projet.id || projet.slug || creerIdentifiant(projet.titre || projet.nom || 'projet'),
        titre: projet.titre || projet.nom || 'Projet sans titre',
        alt: projet.alt || projet.titre || projet.nom || 'Image du projet',
        description: projet.description || '',
        categorie: projet.categorie || projet.category || ''
    })).filter((projet) => projet.image);
}

function extraireImage(valeur) {
    if (typeof valeur === 'string') {
        return valeur;
    }

    if (Array.isArray(valeur) && valeur[0]) {
        return valeur[0].url || valeur[0].thumbnails?.large?.url || '';
    }

    return '';
}

function normaliserNomChamp(nom) {
    return nom
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, '');
}

async function recupererEnregistrements() {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = encodeURIComponent(process.env.AIRTABLE_TABLE_NAME);
    const token = process.env.AIRTABLE_TOKEN;
    const enregistrements = [];
    let offset = '';

    do {
        const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableName}`);

        if (offset) {
            url.searchParams.set('offset', offset);
        }

        const reponse = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!reponse.ok) {
            const details = await reponse.text();
            throw new Error(`Airtable a répondu avec le statut ${reponse.status}: ${details}`);
        }

        const donnees = await reponse.json();
        enregistrements.push(...(donnees.records || []));
        offset = donnees.offset || '';
    } while (offset);

    return enregistrements;
}

async function synchroniser() {
    if (!process.env.AIRTABLE_TOKEN?.trim() || !process.env.AIRTABLE_BASE_ID?.trim() || !process.env.AIRTABLE_TABLE_NAME?.trim()) {
        throw new Error('Les variables Airtable sont absentes.');
    }

    const enregistrements = await recupererEnregistrements();
    const projets = enregistrements.map((enregistrement) => {
        const champs = Object.fromEntries(
            Object.entries(enregistrement.fields || {}).map(([nom, valeur]) => [normaliserNomChamp(nom), valeur])
        );
        const titre = champs.titre || champs.nom || 'Projet sans titre';

        return {
            identifiant: champs.identifiant || champs.slug || enregistrement.id,
            titre,
            image: extraireImage(champs.image),
            alt: champs.alt || titre,
            description: champs.description || '',
            categorie: champs.categorie || champs.category || '',
            colonne: String(champs.colonne || '1')
        };
    }).filter((projet) => projet.image);

    console.log(`${enregistrements.length} enregistrement(s) Airtable reçu(s).`);

    if (enregistrements.length > 0 && projets.length === 0) {
        throw new Error('Aucun projet ne contient une image. Vérifie que le champ s’appelle image et contient une pièce jointe ou une URL.');
    }

    const { writeFile } = await import('node:fs/promises');

    await writeFile(
        'data/projets.json',
        `${JSON.stringify(projets, null, 2)}\n`,
        'utf8'
    );

    console.log(`${projets.length} projet(s) synchronisé(s).`);
}

async function chargerProjets() {
    const reponse = await fetch('data/projets.json');

    if (!reponse.ok) {
        throw new Error(`Le tableau n'a pas pu être chargé (${reponse.status}).`);
    }

    return normaliserProjets(await reponse.json());
}

export { chargerProjets, normaliserProjets, synchroniser };

if (typeof process !== 'undefined' && process.argv[1]?.endsWith('data.js')) {
    synchroniser().catch((erreur) => {
        console.error(erreur.message);
        process.exitCode = 1;
    });
}