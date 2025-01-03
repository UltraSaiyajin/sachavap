import { initializeApp } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js";
import { getFirestore, collection, doc, getDocs, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore.js";

// Configuration Firebase
const firebaseConfig = {
    apiKey: "VOTRE_API_KEY",
    authDomain: "VOTRE_PROJECT.firebaseapp.com",
    projectId: "VOTRE_PROJECT",
  };
  
  // Initialisation Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  
  // Fonction pour récupérer les produits
  async function chargerProduits() {
    const produitsRef = db.collection("produits");
    const snapshot = await produitsRef.get();
  
    const produits = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  
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
  }
  
  // Charger les produits lors du chargement de la page
  window.onload = async () => {
    await chargerProduits();
  };
// Mettre à jour la marge totale dans Firestore
async function incrementerMarge(marge) {
  const statsRef = doc(db, "stats", "globalStats");
  await updateDoc(statsRef, {
    margeTotale: increment(marge),
  });
}

// Récupérer la marge totale depuis Firestore
async function recupererMargeTotale() {
  const statsRef = doc(db, "stats", "globalStats");
  const statsSnap = await getDoc(statsRef);
  if (statsSnap.exists()) {
    const margeTotale = statsSnap.data().margeTotale;
    document.querySelector("#total-marge").textContent = margeTotale.toFixed(2);
  } else {
    console.error("Le document globalStats n'existe pas !");
  }
}

// Gestion des ventes
document.querySelector("#vente-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const produitId = document.querySelector("#produit").value;
  const quantite = parseInt(document.querySelector("#quantite").value);
  const prixUnitaire = parseFloat(document.querySelector("#prix").value);

  const produitRef = doc(db, "produits", produitId);
  const produitSnap = await getDoc(produitRef);
  if (produitSnap.exists()) {
    const produit = produitSnap.data();

    if (produit.quantite >= quantite) {
      const nouvelleQuantite = produit.quantite - quantite;
      const marge = (prixUnitaire - produit.prixAchat) * quantite;

      // Mettre à jour la quantité restante
      await updateDoc(produitRef, { quantite: nouvelleQuantite });

      // Incrémenter la marge totale
      await incrementerMarge(marge);

      // Recharger les données
      await chargerProduits();
      await recupererMargeTotale();

      alert("Vente enregistrée avec succès !");
      e.target.reset();
    } else {
      alert("Quantité insuffisante pour effectuer la vente.");
    }
  } else {
    alert("Produit introuvable.");
  }
});

// Initialisation
await chargerProduits();
await recupererMargeTotale();
