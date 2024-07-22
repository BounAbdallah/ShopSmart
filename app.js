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

  const filterDateInput = document.getElementById("filterDate");

  let currentUserId = null;

  // Fonction pour formater la date
  function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', options);
  }

  // Afficher la page d'inscription
  showSignupPageButton.addEventListener("click", function () {
    toggleSections('signup');
  });

  // Afficher la page de connexion
  showLoginPageButton.addEventListener("click", function () {
    toggleSections('login');
  });

  // Afficher la section d'ajout de produit
  showAddProductSectionButton.addEventListener("click", function () {
    toggleSections('addProduct');
  });

  // Afficher la section de liste des produits
  showProductListSectionButton.addEventListener("click", async function () {
    toggleSections('productList');
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
    toggleSections('login');
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
      toggleSections('app');
      await fetchAndDisplayUserInfo();
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
    toggleSections('signup');
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

  filterDateInput.addEventListener("change", async function () {
    await fetchAndDisplayProducts();
  });

  async function fetchAndDisplayProducts() {
    if (!currentUserId) {
      console.error("ID utilisateur non fourni.");
      return;
    }

    const selectedDate = filterDateInput.value;
    let query = database.from("products").select("*").eq("user_id", currentUserId);

    if (selectedDate) {
      query = query.eq("date", selectedDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erreur lors de la récupération des produits:", error.message);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de la récupération des produits: ' + error.message,
      });
      return;
    }

    const productList = document.getElementById("productList");
    const noProductsMessage = document.getElementById("noProductsMessage");
    const totalPriceSection = document.getElementById("totalPriceSection");
    const totalPriceElement = document.getElementById("totalPrice");

    productList.innerHTML = "";
    totalPriceElement.textContent = "";

    if (data.length === 0) {
      noProductsMessage.style.display = "block";
      totalPriceSection.style.display = "none";
    } else {
      noProductsMessage.style.display = "none";
      let totalPrice = 0;

      data.forEach((product) => {
        const statusClass = product.purchased
          ? "purchased"
          : product.canceled
          ? "canceled"
          : "pending";
        const productCard = document.createElement("div");
        productCard.className = `product-card ${statusClass}`;

        const productInfo = document.createElement("div");
        productInfo.className = "product-info";

        const productName = document.createElement("h3");
        productName.textContent = product.name;

        const productDetails = document.createElement("p");
        productDetails.textContent = `Prix: ${product.price} € - Quantité: ${product.quantity} - Date: ${formatDate(product.date)}`;

        const actionsContainer = document.createElement("div");
        actionsContainer.className = "actions-container";

        const viewDetailsButton = document.createElement("button");
        viewDetailsButton.textContent = "Voir les détails";
        viewDetailsButton.addEventListener("click", function () {
          viewProductDetails(product);
        });

        productInfo.appendChild(productName);
        productInfo.appendChild(productDetails);
        actionsContainer.appendChild(viewDetailsButton);
        productCard.appendChild(productInfo);
        productCard.appendChild(actionsContainer);
        productList.appendChild(productCard);

        if (!product.canceled) {
          totalPrice += product.price * product.quantity;
        }
      });

      totalPriceElement.textContent = `Prix total: ${totalPrice} €`;
      totalPriceSection.style.display = "block";
    }
  }

  function viewProductDetails(product) {
    toggleSections("editProduct");

    const editProductName = document.getElementById("editProductName");
    const editProductPrice = document.getElementById("editProductPrice");
    const editProductQuantity = document.getElementById("editProductQuantity");
    const editSelectedDate = document.getElementById("editSelectedDate");
    const editPurchasedCheckbox = document.getElementById("editPurchased");
    const editCanceledCheckbox = document.getElementById("editCanceled");
    const saveEditButton = document.getElementById("saveEditButton");
    const deleteProductButton = document.getElementById("deleteProductButton");

    editProductName.value = product.name;
    editProductPrice.value = product.price;
    editProductQuantity.value = product.quantity;
    editSelectedDate.value = product.date;
    editPurchasedCheckbox.checked = product.purchased;
    editCanceledCheckbox.checked = product.canceled;

    saveEditButton.onclick = async function () {
      const updatedProduct = {
        name: editProductName.value,
        price: editProductPrice.value,
        quantity: editProductQuantity.value,
        date: editSelectedDate.value,
        purchased: editPurchasedCheckbox.checked,
        canceled: editCanceledCheckbox.checked,
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
        text: 'Produit mis à jour avec succès !',
      });
      toggleSections("productList");
      await fetchAndDisplayProducts();
    };

    deleteProductButton.onclick = async function () {
      const { error } = await database.from("products").delete().eq("id", product.id);

      if (error) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la suppression du produit: ' + error.message,
        });
        return;
      }

      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: 'Produit supprimé avec succès !',
      });
      toggleSections("productList");
      await fetchAndDisplayProducts();
    };
  }

  async function fetchAndDisplayUserInfo() {
    const { data: user, error } = await database.from("users").select("*").eq("id", currentUserId).single();

    if (error) {
      console.error("Erreur lors de la récupération des informations utilisateur:", error.message);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de la récupération des informations utilisateur: ' + error.message,
      });
      return;
    }

    if (user) {
      userInfoSection.textContent = `Bonjour, ${user.name} !`;
    } else {
      console.error("Utilisateur introuvable.");
    }
  }

  function toggleSections(section) {
    signupPage.style.display = "none";
    loginPage.style.display = "none";
    appSection.style.display = "none";
    addProductSection.style.display = "none";
    productListSection.style.display = "none";
    editProductSection.style.display = "none";

    switch (section) {
      case "signup":
        signupPage.style.display = "block";
        break;
      case "login":
        loginPage.style.display = "block";
        break;
      case "app":
        appSection.style.display = "block";
        break;
      case "addProduct":
        addProductSection.style.display = "block";
        break;
      case "productList":
        productListSection.style.display = "block";
        break;
      case "editProduct":
        editProductSection.style.display = "block";
        break;
      default:
        loginPage.style.display = "block";
    }
  }

  async function handleDatabaseOperation(operation, ...params) {
    try {
      const { error } = await operation(...params);
      if (error) throw error;
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de l\'opération sur la base de données: ' + error.message,
      });
    }
  }

  toggleSections('signup');
});
