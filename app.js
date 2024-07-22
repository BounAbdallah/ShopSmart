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

    toggleSections('signup');
});
