import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc,getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";


  const firebaseConfig = {
    apiKey: "AIzaSyDntXwsq3L_-gam8AgbspWkuyjLcWwuT0s",
    authDomain: "sachavap-13576.firebaseapp.com",
    projectId: "sachavap-13576",
    storageBucket: "sachavap-13576.firebasestorage.app",
    messagingSenderId: "678876211657",
    appId: "1:678876211657:web:7a398b327934bfb91e2018"
  };

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fonction pour récupérer et afficher les produits
async function chargerProduits() {
  try {
    const produitsRef = collection(db, "produits"); // Référence à la collection "produits"
    const snapshot = await getDocs(produitsRef);

    const produits = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Affichage des produits dans le tableau HTML
    const tableBody = document.querySelector("#produits-table tbody");
    tableBody.innerHTML = ""; // Réinitialiser le tableau

    produits.forEach(produit => {
      const row = `
        <tr>
          <td>${produit.nom}</td>
          <td>${produit.quantite}</td>
        </tr>
      `;
      tableBody.insertAdjacentHTML("beforeend", row);
    });

    // Mise à jour de la liste déroulante des produits
    const produitSelect = document.querySelector("#produit");
    produitSelect.innerHTML = ""; // Réinitialiser la liste déroulante
    produits.forEach(produit => {
      const option = `<option value="${produit.id}">${produit.nom}</option>`;
      produitSelect.insertAdjacentHTML("beforeend", option);
    });

    console.log("Produits chargés :", produits);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits :", error);
  }
}

// Fonction pour ajouter un log de vente
async function ajouterLogVente(produitNom, quantite, prixUnitaire) {
  try {
    const logsRef = collection(db, "logs");
    const date = new Date().toISOString(); // Format de la date ISO 8601
    await addDoc(logsRef, {
      produit: produitNom,
      quantite: quantite,
      prixUnitaire: prixUnitaire,
      date: date,
    });
    console.log(`Log ajouté : ${produitNom}, Quantité : ${quantite}, Prix : ${prixUnitaire}, Date : ${date}`);
  } catch (error) {
    console.error("Erreur lors de l'ajout du log de vente :", error);
  }
}


// Fonction pour incrémenter les statistiques de vente
async function incrementerStatsVente(quantite, montant) {
  try {
    console.log(`Quantité vendue : ${quantite}, Montant encaissé : ${montant}`);
    const statsRef = doc(db, "stats", "globalStats");
    await updateDoc(statsRef, {
      produitsVendus: increment(quantite),
      montantTotal: increment(montant),
    });
    console.log(`Statistiques mises à jour : +${quantite} produits, +${montant} €`);
  } catch (error) {
    console.error("Erreur lors de la mise à jour des statistiques de vente :", error);
  }
}

// Fonction pour récupérer et afficher les logs des ventes
async function chargerLogs() {
  try {
    const logsRef = collection(db, "logs");
    const snapshot = await getDocs(logsRef);

    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Affichage des logs dans le tableau HTML
    const logsTable = document.querySelector("#logs-table");
    logsTable.innerHTML = ""; // Réinitialiser la table

    logs.forEach(log => {
      const row = `
        <tr>
          <td>${log.produit}</td>
          <td>${log.quantite}</td>
          <td>${log.prixUnitaire.toFixed(2)}</td>
          <td>${new Date(log.date).toLocaleString()}</td>
        </tr>
      `;
      logsTable.insertAdjacentHTML("beforeend", row);
    });

    console.log("Logs chargés :", logs);
  } catch (error) {
    console.error("Erreur lors de la récupération des logs :", error);
  }
}

// Fonction pour incrémenter la marge totale dans Firestore
async function incrementerMarge(marge) {
  try {
    const statsRef = doc(db, "stats", "globalStats");
    await updateDoc(statsRef, {
      margeTotale: increment(marge),
    });
    console.log(`Marge totale incrémentée de ${marge} €`);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la marge totale :", error);
  }
}

// Fonction pour récupérer et afficher les statistiques
async function recupererStatsResume() {
  try {
    const statsRef = doc(db, "stats", "globalStats");
    const statsSnap = await getDoc(statsRef);

    if (statsSnap.exists()) {
      const stats = statsSnap.data();
      document.querySelector("#total-marge").textContent = stats.margeTotale.toFixed(2);
      document.querySelector("#total-produits-vendus").textContent = stats.produitsVendus;
      document.querySelector("#total-montant").textContent = stats.montantTotal.toFixed(2);
      console.log("Statistiques Résumé :", stats);
    } else {
      console.error("Le document globalStats n'existe pas !");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques de résumé :", error);
  }
}

// Gestion des ventes
document.querySelector("#vente-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const produitId = document.querySelector("#produit").value;
  const quantite = parseInt(document.querySelector("#quantite").value);
  const prixUnitaire = parseFloat(document.querySelector("#prix").value);

  try {
    const produitRef = doc(db, "produits", produitId);
    const produitSnap = await getDoc(produitRef);

    if (produitSnap.exists()) {
      const produit = produitSnap.data();

      if (produit.quantite >= quantite) {
        const nouvelleQuantite = produit.quantite - quantite;
        const marge = (prixUnitaire - produit.prixAchat) * quantite;
        const montantVente = quantite * prixUnitaire;

        // Mettre à jour la quantité dans Firestore
        await updateDoc(produitRef, { quantite: nouvelleQuantite });

        // Mettre à jour la marge totale
        await incrementerMarge(marge);

        // Mettre à jour les statistiques de vente
        await incrementerStatsVente(quantite, montantVente);

        // Ajouter un log de la vente
        await ajouterLogVente(produit.nom, quantite, prixUnitaire);


        // Recharger les produits et la marge totale
        await chargerProduits();
        await recupererStatsResume();

        alert("Vente enregistrée avec succès !");
        e.target.reset();
      } else {
        alert("Quantité insuffisante pour effectuer la vente.");
      }
    } else {
      alert("Produit introuvable.");
    }
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la vente :", error);
  }
});

// Initialisation au chargement de la page
window.onload = async () => {
  await chargerProduits();
  await recupererStatsResume();
  await chargerLogs(); // Charger les logs
};

// Appeler après une vente réussie
await chargerLogs();
