const projectPage = document.querySelector('.page-projet');

function formatFieldName(fieldName) {
    return fieldName
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, letter => letter.toUpperCase());
}

function createFieldValue(value, fieldName) {
    if (Array.isArray(value)) {
        const attachmentValues = value.filter(item => item && typeof item === 'object' && item.url);

        if (attachmentValues.length) {
            const mediaGroup = document.createElement('div');
            mediaGroup.className = 'page-projet__medias';

            const orderedAttachments = fieldName === 'images page'
                ? [...attachmentValues].sort((firstAttachment, secondAttachment) => {
                    return (Number(firstAttachment.width) || 0) - (Number(secondAttachment.width) || 0);
                })
                : attachmentValues;

            orderedAttachments.forEach((attachment, index) => {
                const media = createProjectMedia(attachment, attachment.name || attachment.filename, {
                    autoplay: false,
                    controls: true
                });
                media.classList.add('page-projet__media');
                if (fieldName === 'images page' && index === orderedAttachments.length - 1) {
                    media.classList.add('page-projet__media--largest');
                }
                mediaGroup.appendChild(media);
            });
            return mediaGroup;
        }

        const list = document.createElement('ul');
        list.className = 'page-projet__liste';
        value.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = typeof item === 'object' ? JSON.stringify(item) : String(item);
            list.appendChild(listItem);
        });
        return list;
    }

    const text = value && typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
    const link = document.createElement('a');

    if (/^https?:\/\//i.test(text)) {
        link.href = text;
        link.textContent = text;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        return link;
    }

    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    return paragraph;
}

function getFirstAttachment(value) {
    if (Array.isArray(value)) {
        return value.find(attachment => attachment && typeof attachment === 'object' && attachment.url);
    }

    return value && typeof value === 'object' && value.url ? value : null;
}

function createProjectGallery(project) {
    const orderedAttachments = [
        getFirstAttachment(project['image page 1']),
        getFirstAttachment(project['image page 2']),
        getFirstAttachment(project['image page 3'])
    ].filter(Boolean);
    const smallMedia = orderedAttachments.slice(0, 2).map(attachment => {
        const media = createProjectMedia(attachment, attachment.name || attachment.filename, {
            autoplay: false,
            controls: true
        });
        media.classList.add('page-projet__media');
        return media;
    });
    const largestAttachment = orderedAttachments[2];

    if (!largestAttachment) {
        return { smallMedia, largestMedia: null };
    }

    const largestMedia = createProjectMedia(
        largestAttachment,
        largestAttachment.name || largestAttachment.filename,
        {
            autoplay: false,
            controls: true
        }
    );
    largestMedia.classList.add('page-projet__media', 'page-projet__media--largest');

    return { smallMedia, largestMedia };
}

function renderProject(project) {
    projectPage.replaceChildren();

    const article = document.createElement('article');
    const title = document.createElement('h1');
    title.textContent = project.titre || 'Projet';
    article.className = 'page-projet__article';
    article.appendChild(title);

    const yearEntry = Object.entries(project).find(([fieldName, value]) => {
        return fieldName.toLowerCase() === 'year'
            && value !== null
            && value !== undefined
            && value !== '';
    });

    if (project.categorie) {
        const category = document.createElement('p');
        category.className = 'page-projet__categorie';
        category.textContent = `Projet ${project.categorie}`;
        article.appendChild(category);
    }

    if (yearEntry) {
        const year = document.createElement('p');
        year.className = 'page-projet__annee';
        year.textContent = createFieldValue(yearEntry[1], yearEntry[0]).textContent;
        article.appendChild(year);
    }

    const mainContent = document.createElement('div');
    const descriptionField = document.createElement('section');
    let largestMedia = null;

    mainContent.className = 'page-projet__contenu';
    descriptionField.className = 'page-projet__champ page-projet__champ--description';

    if (project['description 1']) {
        descriptionField.appendChild(createFieldValue(project['description 1'], 'description 1'));
        mainContent.appendChild(descriptionField);
    }

    if (project['image page 1'] || project['image page 2'] || project['image page 3']) {
        const gallery = createProjectGallery(project);
        gallery.smallMedia.forEach((media, index) => {
            media.classList.add(index === 0
                ? 'page-projet__media--first'
                : 'page-projet__media--second-row');
            mainContent.appendChild(media);
        });
        if (project['description 2']) {
            const descriptionTwo = createFieldValue(project['description 2'], 'description 2');
            descriptionTwo.classList.add('page-projet__description-2');
            mainContent.appendChild(descriptionTwo);
        }
        largestMedia = gallery.largestMedia;
    }

    if (mainContent.children.length) {
        article.appendChild(mainContent);
    }

    // ajout des champs supplémentaires du projet
    Object.entries(project).forEach(([fieldName, value]) => {
        if (fieldName.toLowerCase() === 'year'
            || fieldName === 'titre'
            || fieldName === 'categorie'
            || fieldName === 'description 1'
            || fieldName === 'description 2'
            || fieldName === 'images page'
            || fieldName === 'image page 1'
            || fieldName === 'image page 2'
            || fieldName === 'image page 3'
            || fieldName === 'image carte'
            || fieldName === 'alt'
            || fieldName === 'id'
            || fieldName === 'identifiant'
            || fieldName === 'colonne'
            || value === null
            || value === undefined
            || value === '') {
            return;
        }

        const field = document.createElement('section');
        const fieldTitle = document.createElement('h2');
        field.className = 'page-projet__champ';
        fieldTitle.textContent = formatFieldName(fieldName);
        field.append(fieldTitle, createFieldValue(value, fieldName));
        article.appendChild(field);
    });

    //Si une image est plus grande que les autres, elle est affichée en bas de la page
    if (largestMedia) {
        const largestMediaGroup = document.createElement('div');
        largestMediaGroup.className = 'page-projet__grande-image';
        largestMediaGroup.appendChild(largestMedia);
        article.appendChild(largestMediaGroup);
    }

    //fait apparaitre la page projet avec les informations du projet séléctionné
    projectPage.appendChild(article);
}

// le javascript affiche les infos qu'il a récupéré
async function loadProject() {
    const projectId = new URLSearchParams(window.location.search).get('id'); //Le javasscript récupère l'id du projet séléctionné

    if (!projectId) {
        projectPage.textContent = 'Aucun projet n’a été sélectionné.';
        return;
    }

    try { // Le javascript récupère les données du projet séléctionné 
        const projects = await fetchData();
        const projectRecord = projects.records.find(record => {
            const project = record.fields;
            return String(project.id ?? project.identifiant) === projectId;
        });

        if (!projectRecord) {
            projectPage.textContent = 'Le projet demandé est introuvable.';
            return;
        }

        renderProject(projectRecord.fields);
    } catch (error) {
        projectPage.textContent = 'Le projet est momentanément indisponible.';
        console.error(error);
    }
}

loadProject();