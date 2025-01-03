import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";


// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD9iuzpUaZq06tTyuEkZHFcNC3AVp18anA",
  authDomain: "sachavap-44007.firebaseapp.com",
  projectId: "sachavap-44007",
  storageBucket: "sachavap-44007.firebasestorage.app",
  messagingSenderId: "928067730354",
  appId: "1:928067730354:web:52b306f821d1f9810742ab"
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

    const tableBody = document.querySelector("#produits-table tbody");
    tableBody.innerHTML = ""; // Réinitialiser le tableau

    produits.forEach(produit => {
      const row = `
        <tr>
          <td>${produit.nom}</td>
          <td>${produit.quantite}</td>
          <td>${produit.prixAchat} €</td>
        </tr>
      `;
      tableBody.insertAdjacentHTML("beforeend", row);
    });

    console.log("Produits chargés :", produits);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits :", error);
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

// Fonction pour récupérer et afficher la marge totale
async function recupererMargeTotale() {
  try {
    const statsRef = doc(db, "stats", "globalStats");
    const statsSnap = await getDoc(statsRef);
    if (statsSnap.exists()) {
      const margeTotale = statsSnap.data().margeTotale;
      document.querySelector("#total-marge").textContent = margeTotale.toFixed(2);
      console.log("Marge totale :", margeTotale);
    } else {
      console.error("Le document globalStats n'existe pas !");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la marge totale :", error);
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

        // Mettre à jour la quantité dans Firestore
        await updateDoc(produitRef, { quantite: nouvelleQuantite });

        // Mettre à jour la marge totale
        await incrementerMarge(marge);

        // Recharger les produits et la marge totale
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
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la vente :", error);
  }
});

// Initialisation au chargement de la page
window.onload = async () => {
  await chargerProduits();
  await recupererMargeTotale();
};
