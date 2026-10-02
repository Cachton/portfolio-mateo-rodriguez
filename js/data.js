const AIRTABLE_TOKEN = "patMIYt4wE2L0laZh.748dab0f62cdb5c833eb8eb5eb2d930a631b7d511f916c21fafe33052a4a2074";
const AIRTABLE_TABLE_NAME = "tbl8q88n5psy8QAc3";
const AIRTABLE_BASE_ID = "appgQISY45dza4nag";

//fetching du data airtable
async function fetchData() {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
        headers: {
            Authorization: `Bearer ${AIRTABLE_TOKEN}`
        }
    });
    if (!response.ok) {
        throw new Error(`Impossible de récupérer les projets (${response.status}).`);
    }

    return await response.json();
}

//
async function init() {
    let projectsArray = [];
    const projectGrid = document.querySelector('.projets__grille');

    if (!projectGrid) {
        return;
    }

    projectGrid.replaceChildren();

    const projectColumns = [1, 2].map(columnNumber => {
        const projectColumn = document.createElement('section');

        projectColumn.className = 'projets__colonne';
        projectColumn.setAttribute('aria-label', `Colonne ${columnNumber}`);
        projectGrid.appendChild(projectColumn);
        return projectColumn;
    });
    try {
        const projects = await fetchData();
        projects.records.forEach(project => {
            projectsArray.push(project.fields);
        });
    } catch (error) {
        projectGrid.textContent = 'Les projets sont momentanément indisponibles.';
        console.error(error);
        return;
    }

    //fait le tri dans les projets selon l'id
    projectsArray.sort((a, b) => a.id - b.id);

    //
    projectsArray.forEach(project => {
        const projectId = project.id ?? project.identifiant;
        const projectCard = document.createElement('article');
        const projectLink = document.createElement('a');
        const projectMedia = createProjectMedia(project['image carte'], project.alt || project.titre);
        const projectInfos = document.createElement('div');
        const projectTitle = document.createElement('h3');
        const projectCategory = document.createElement('p');

        projectCard.className = 'projet';
        projectLink.className = 'projet__lien';
        projectLink.href = `projet.html?id=${encodeURIComponent(projectId)}`; // Le javascript créé un lien vers la page projet.html avec l'id du projet en paramètre
        projectLink.setAttribute('aria-label', `Voir le projet ${project.titre}`);

        projectTitle.className = 'projet__titre';
        projectTitle.textContent = project.titre;
        projectCategory.className = 'projet__categorie';
        projectCategory.textContent = project.categorie || project.category || '';

        projectInfos.className = 'projet__infos';
        projectInfos.append(projectTitle, projectCategory);
        projectLink.append(projectMedia, projectInfos);
        projectCard.appendChild(projectLink);
        const columnNumber = Number(project.colonne) === 2 ? 2 : 1;

        projectColumns[columnNumber - 1].appendChild(projectCard);
    });


}

function createProjectMedia(image, altText, options = {}) {
    const attachment = getAttachment(image);

    if (isVideoAttachment(attachment)) {
        const projectVideo = document.createElement('video');

        projectVideo.className = 'projet__image';
        projectVideo.src = attachment.url;
        projectVideo.autoplay = options.autoplay ?? true;
        projectVideo.muted = true;
        projectVideo.loop = true;
        projectVideo.controls = options.controls ?? false;
        projectVideo.preload = 'metadata';
        projectVideo.playsInline = true;
        projectVideo.disablePictureInPicture = true;
        projectVideo.controlsList.add('nofullscreen');
        projectVideo.setAttribute('aria-label', altText || 'Vidéo du projet');
        projectVideo.addEventListener('contextmenu', event => event.preventDefault());
        return projectVideo;
    }

    const projectImage = document.createElement('img');

    projectImage.className = 'projet__image';
    projectImage.src = attachment.url;
    projectImage.alt = altText || 'Image du projet';
    return projectImage;
}

function getAttachment(image) {
    if (typeof image === 'string') {
        return { url: image, type: '', filename: image };
    }

    if (image && typeof image === 'object' && !Array.isArray(image)) {
        return {
            url: image.url || image.thumbnails?.large?.url || '',
            type: image.type || '',
            filename: image.filename || ''
        };
    }

    if (Array.isArray(image) && image[0]) {
        return {
            url: image[0].url || image[0].thumbnails?.large?.url || '',
            type: image[0].type || '',
            filename: image[0].filename || ''
        };
    }

    return { url: '', type: '', filename: '' };
}

function isVideoAttachment(attachment) {
    return attachment.type.startsWith('video/')
        || /\.(mp4|webm|ogg|mov)(?:$|[?#])/i.test(attachment.filename)
        || /\.(mp4|webm|ogg|mov)(?:$|[?#])/i.test(attachment.url);
}

init();