// script.js

// Initialisation des données
let produits = JSON.parse(localStorage.getItem('produits')) || [
    { id: 1, nom: 'Lush Ice', quantite: 200, prixAchat: 4 },
    { id: 2, nom: 'Lucid Dream', quantite: 130, prixAchat: 4 },
    { id: 3, nom: 'Blueberry Bubblegum', quantite: 130, prixAchat: 4 },
    { id: 4, nom: 'Two Apple', quantite: 300, prixAchat: 4 },
    { id: 5, nom: 'Magic Love', quantite: 70, prixAchat: 4 },
    { id: 6, nom: 'Grape Mint', quantite: 150, prixAchat: 4 },
    { id: 7, nom: 'Gum Mint', quantite: 100, prixAchat: 4 },
    { id: 8, nom: 'Peach Ice', quantite: 170, prixAchat: 4 },
  ];
  let ventes = JSON.parse(localStorage.getItem('ventes')) || [];
let totalMarge = parseFloat(localStorage.getItem('totalMarge')) || 0; // Charger la marge depuis localStorage
let logs = JSON.parse(localStorage.getItem('logs')) || [];

// Fonction pour afficher les produits
function afficherProduits() {
  const tableBody = document.querySelector('#produits-table tbody');
  tableBody.innerHTML = '';
  produits.forEach((produit) => {
    const row = `
      <tr>
        <td>${produit.nom}</td>
        <td>${produit.quantite}</td>
      </tr>
    `;
    tableBody.insertAdjacentHTML('beforeend', row);
  });

  // Mise à jour du select pour les ventes
  const produitSelect = document.querySelector('#produit');
  produitSelect.innerHTML = '';
  produits.forEach((produit) => {
    const option = `<option value="${produit.id}">${produit.nom}</option>`;
    produitSelect.insertAdjacentHTML('beforeend', option);
  });
}

// Fonction pour ajouter une nouvelle entrée de log
function ajouterLog(produit, quantite, prix, marge) {
  const date = new Date().toLocaleString();
  const logEntry = `Date: ${date}, Produit: ${produit.nom}, Quantité: ${quantite}, Prix unitaire: ${prix}, Marge: ${marge.toFixed(2)}€`;
  logs.push(logEntry);

  // Stocker les logs dans localStorage
  localStorage.setItem('logs', JSON.stringify(logs));
}

// Fonction pour générer le fichier de logs
function telechargerLogs() {
  const logContent = logs.join('\n');
  const blob = new Blob([logContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'logs.txt';
  a.click();
  URL.revokeObjectURL(url); // Nettoyer l'URL
}

// Ajouter un listener au bouton de téléchargement
document.querySelector('#download-logs').addEventListener('click', telechargerLogs);

// Gestion de l'enregistrement des ventes
document.querySelector('#vente-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const produitId = parseInt(document.querySelector('#produit').value);
  const quantite = parseInt(document.querySelector('#quantite').value);
  const prix = parseFloat(document.querySelector('#prix').value);

  const produit = produits.find((p) => p.id === produitId);

  if (produit) {
    if (produit.quantite >= quantite) {
      // Déduction de la quantité et calcul de la marge
      produit.quantite -= quantite;
      const marge = (prix - produit.prixAchat) * quantite;
      totalMarge += marge; // Mettre à jour la marge totale

      // Stocker la marge totale dans localStorage
      localStorage.setItem('totalMarge', totalMarge);

      // Ajouter la vente
      ventes.push({ produitId, quantite, prix, marge });
      localStorage.setItem('produits', JSON.stringify(produits));
      localStorage.setItem('ventes', JSON.stringify(ventes));

      // Ajouter un log pour la vente
      ajouterLog(produit, quantite, prix, marge);

      // Mettre à jour l'affichage
      afficherProduits();
      document.querySelector('#total-marge').textContent = totalMarge.toFixed(2);

      // Réinitialiser le formulaire
      e.target.reset();
    } else {
      alert('Quantité insuffisante.');
    }
  } else {
    alert('Produit non valide.');
  }
});

// Initialisation au chargement
afficherProduits();
document.querySelector('#total-marge').textContent = totalMarge.toFixed(2);


// Ajouter un listener au bouton de téléchargement
document.querySelector('#download-logs').addEventListener('click', telechargerLogs);

