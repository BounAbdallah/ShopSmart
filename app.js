const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1eXBkc3ZudmV4bGRxbGR1anV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjExMzA0NjcsImV4cCI6MjAzNjcwNjQ2N30.UmYRinhMa5_GtUIU9au9GCQJboY_sD2vEPaRv7bTjns";
const url = "https://suypdsvnvexldqldujuy.supabase.co";
const database = supabase.createClient(url, key);

document.addEventListener("DOMContentLoaded", async function () {
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const addProductForm = document.getElementById("addProductForm");
  const selectedDateInput = document.getElementById("selectedDate");
  const logoutButton = document.getElementById("logoutButton");

  const signupPage = document.getElementById("signupPage");
  const loginPage = document.getElementById("loginPage");
  const appSection = document.getElementById("appSection");
  const addProductSection = document.getElementById("addProductSection");
  const productListSection = document.getElementById("productListSection");
  const editProductSection = document.getElementById("editProductSection");
  const userInfoSection = document.getElementById("userInfo");

  const showSignupPageButton = document.getElementById("showSignupPage");
  const showLoginPageButton = document.getElementById("showLoginPage");
  const showAddProductSectionButton = document.getElementById("showAddProductSection");
  const showProductListSectionButton = document.getElementById("showProductListSection");

  // Fonction pour formater la date
  function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', options);
  }

  // Sélectionner l'élément span où afficher la date
  const dateSpan = document.querySelector('.tete span');

  // Supposons que vous avez un objet "product" avec une propriété "date" contenant une date au format chaîne de caractères
  const product = {
    date: '2023-06-15T10:30:00Z'
  };

  // Formater la date et l'afficher dans l'élément span
  dateSpan.textContent = formatDate(product.date);

  let currentUserId = null;

  // Afficher la page d'inscription
  showSignupPageButton.addEventListener("click", function () {
    signupPage.style.display = "block";
    loginPage.style.display = "none";
    appSection.style.display = "none";
    addProductSection.style.display = "none";
    productListSection.style.display = "none";
    editProductSection.style.display = "none";
  });

  // Afficher la page de connexion
  showLoginPageButton.addEventListener("click", function () {
    signupPage.style.display = "none";
    loginPage.style.display = "block";
    appSection.style.display = "none";
    addProductSection.style.display = "none";
    productListSection.style.display = "none";
    editProductSection.style.display = "none";
  });

  // Afficher la section d'ajout de produit
  showAddProductSectionButton.addEventListener("click", function () {
    addProductSection.style.display = "block";
    productListSection.style.display = "none";
    editProductSection.style.display = "none";
  });

  // Afficher la section de liste des produits
  showProductListSectionButton.addEventListener("click", async function () {
    addProductSection.style.display = "none";
    productListSection.style.display = "block";
    editProductSection.style.display = "none";
    await fetchAndDisplayProducts();
  });

  // Gérer la soumission du formulaire d'inscription
  signupForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Les mots de passe ne correspondent pas.',
      });
      return;
    }

    const { data: user, error } = await database.auth.signUp({ email, password });
    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de l\'inscription: ' + error.message,
      });
      return;
    }

    await handleDatabaseOperation(database.from("users").insert, [{ id: user.user.id, name, email }]);
    Swal.fire({
      icon: 'success',
      title: 'Succès',
      text: 'Inscription réussie !',
    });
    signupPage.style.display = "none";
    loginPage.style.display = "block";
  });

  // Gérer la soumission du formulaire de connexion
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const { data: { user }, error } = await database.auth.signIn({ email, password });

    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur de connexion: ' + error.message,
      });
      return;
    }

    if (user) {
      currentUserId = user.id;
      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: 'Connexion réussie !',
      });

      signupPage.style.display = "none";
      loginPage.style.display = "none";
      appSection.style.display = "block";
      productListSection.style.display = "block";

      await fetchAndDisplayProducts();
    } else {
      console.error("Objet utilisateur manquant ou mal formé.");
    }
  });

  // Gérer le clic sur le bouton de déconnexion
  logoutButton.addEventListener("click", async function () {
    await database.auth.signOut();
    currentUserId = null;
    Swal.fire({
      icon: 'success',
      title: 'Déconnexion',
      text: 'Déconnexion réussie !',
    });
    signupPage.style.display = "none";
    loginPage.style.display = "block";
    appSection.style.display = "none";
    userInfoSection.style.display = "none";
    addProductSection.style.display = "none";
    productListSection.style.display = "none";
    editProductSection.style.display = "none";
  });

  // Gérer la soumission du formulaire d'ajout de produit
  addProductForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const productName = document.getElementById("productName").value;
    const productPrice = document.getElementById("productPrice").value;
    const productQuantity = document.getElementById("productQuantity").value;
    const selectedDate = selectedDateInput.value;

    if (!currentUserId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Veuillez vous connecter d\'abord.',
      });
      return;
    }

    const { error } = await database.from("products").insert([
      {
        name: productName,
        price: productPrice,
        quantity: productQuantity,
        date: selectedDate,
        user_id: currentUserId,
      },
    ]);

    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de l\'ajout du produit: ' + error.message,
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Succès',
      text: 'Produit ajouté avec succès !',
    });
    addProductForm.reset();
    await fetchAndDisplayProducts();
  });

  // Gérer le changement de filtre de date
  const filterDateInput = document.getElementById("filterDate");
  filterDateInput.addEventListener("change", async function () {
    await fetchAndDisplayProducts();
  });

  // Fonction pour récupérer et afficher les produits
  async function fetchAndDisplayProducts() {
    console.log("Fetching Products");

    if (!currentUserId) {
      console.error("ID utilisateur non fourni.");
      return;
    }

    const selectedDate = filterDateInput.value;
    let query = database.from("products").select("*").eq("user_id", currentUserId);

    if (selectedDate) {
      query = query.eq("date", selectedDate);
    }

    const { data: products, error } = await query;

    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de la récupération des produits: ' + error.message,
      });
      return;
    }

    const productList = document.getElementById("productList");
    productList.innerHTML = "";
    
    products.forEach(product => {
      const statusClass = product.purchased
        ? 'product-purchased'
        : product.cancelled
        ? 'product-cancelled'
        : 'product-pending';
    
      const productCard = document.createElement("div");
      productCard.className = `product-card ${statusClass}`;
      productCard.innerHTML = `
        <div class="donnes">
          <p>${product.name}</p>
          <p>${product.price} FCFA</p>
          <p>X</p>
          <p>${product.quantity}</p>
          <p>Total: ${(product.price * product.quantity)} FCFA</p>
        </div>
        <div class="donnes">
        <p>${formatDate(product.date)}</p>

        <p>Etat: ${product.purchased ? 'Acheter ✅' : product.cancelled ? 'Annuler ❌' : 'En attente 🕐'}</p>
        </div>
      `;
    
      // Set the color based on the status
      switch (statusClass) {
        case 'product-purchased':
          productCard.style.backgroundColor = '#6AB357';
          break;
        case 'product-cancelled':
          productCard.style.backgroundColor = '#E45C5C';
          break;
        case 'product-pending':
          productCard.style.backgroundColor = '#B39957';
          break;
      }
    
      // Disable clicking if status is already set
      if (product.purchased || product.cancelled) {
        productCard.style.pointerEvents = 'none'; // Disable click events
        productCard.style.opacity = '0.6'; // Optional: visually indicate disabled state
      } else {
        productCard.addEventListener("click", async function () {
          const { value: status } = await Swal.fire({
            title: 'Changer le statut du produit',
            input: 'select',
            inputOptions: {
              'pending': 'En attente',
              'purchased': 'Acheter',
              'cancelled': 'Annuler',
            },
            inputPlaceholder: 'Sélectionnez un statut',
            showCancelButton: true,
          });
    
          if (status) {
            const updatedProduct = {
              purchased: status === 'purchased',
              cancelled: status === 'cancelled'
            };
    
            const { error } = await database.from("products").update(updatedProduct).eq("id", product.id);
    
            if (error) {
              Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Erreur lors de la mise à jour du produit: ' + error.message,
              });
              return;
            }
    
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: 'Statut du produit mis à jour avec succès !',
            });
    
            await fetchAndDisplayProducts();
          }
        });
      }
    
      productList.appendChild(productCard);
    });
      }

  // Fonction pour gérer les opérations sur la base de données
  async function handleDatabaseOperation(operation, data) {
    const { error } = await operation(data);
    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de l\'opération sur la base de données: ' + error.message,
      });
    }
  }
});
