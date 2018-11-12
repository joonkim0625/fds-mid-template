import "@babel/polyfill"; // 이 라인을 지우지 말아주세요!

import axios from "axios";

const api = axios.create({
  baseURL: process.env.API_URL
});

api.interceptors.request.use(function(config) {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authoriization"] = "Bearer" + token;
  }
  return config;
});

const templates = {
  layout: document.querySelector("#layout").content,
  loginForm: document.querySelector("#login-form").content,
  productList: document.querySelector("#product-list").content,
  productItem: document.querySelector('#product-item').content,
  productDetail: document.querySelector('#product-detail').content,
  detailImage: document.querySelector('#detail-image').content
};

const rootEl = document.querySelector(".root");

async function drawFragment(frag) {
  const layoutFrag = document.importNode(templates.layout, true);

  const mainEl = layoutFrag.querySelector(".main");
  const logoEl = layoutFrag.querySelector(".logo");
  const signUpEl = layoutFrag.querySelector(".sign-up");
  const signInEl = layoutFrag.querySelector(".sign-in");
  const signOutEl = layoutFrag.querySelector(".sign-out");
  const cartEl = layoutFrag.querySelector(".cart");
  const orderEl = layoutFrag.querySelector(".order");

  const allEl = layoutFrag.querySelector(".all");
  const topEl = layoutFrag.querySelector(".top");
  const pantsEl = layoutFrag.querySelector(".pants");
  const shoesEl = layoutFrag.querySelector(".shoes");

  if (localStorage.getItem("token")) {
    try {
      const { data: username } = await api.get("/me");
      signOutEl.classList.remove("hidden");
    } catch (e) {
      alert("유효하지 않은 토큰입니다. 다시 로그인해주세요.");
      localStorage.removeItem("token");
      drawLoginForm();
      return;
    }
  } else {
    signInEl.classList.remove("hidden");
    signUpEl.classList.remove("hidden");
  }

  logoEl.addEventListener("click", e => {
    drawProductList();
  });
  signInEl.addEventListener('click', e => {
    drawLoginForm()
  })

  mainEl.appendChild(frag);
  rootEl.textContent = "";
  rootEl.appendChild(layoutFrag);
  window.scrollTo(0, 0);
}

async function drawLoginForm() {
  const frag = document.importNode(templates.loginForm, true);

  const loginFormEl = frag.querySelector(".login-form");

  loginFormEl.addEventListener("submit", async e => {
    e.preventDefault();
    const username = e.target.elements.username.value;
    const password = e.target.elements.password.value;

    const {
      data: { token }
    } = await api.post("/users/login", {
      username,
      password
    });
    localStorage.setItem("token", token);
    drawProductList();
  });
  drawFragment(frag);
}



async function drawProductList(category) {
  const frag = document.importNode(templates.productList, true);

  const productListEl = frag.querySelector(".product-list");
  const headerEl = frag.querySelector(".header");

  const params = {};

  if (category) {
    params.category = category;
  }
  const { data: productList } = await api.get("/products", {
    params
  });

  headerEl.textContent = (category ? category.toUpperCase() : "전체 상품 목록")

  if (productList.length > 0) {
    for (const {
      id: productId, title, description, mainImgUrl
    } of productList) {
      const frag = document.importNode(templates.productItem, true)

      const productItemEl = frag.querySelector('.product-item')
      const mainImageEl = frag.querySelector('.main-image')
      const titleEl = frag.querySelector('.title')
      const descriptionEl = frag.querySelector('.description')


      mainImageEl.setAttribute('src', mainImgUrl)
      titleEl.textContent = title
      descriptionEl.textContent = description

      productItemEl.addEventListener('click', e => {
        drawProductDetail(productId)
      })

      productListEl.appendChild(frag)
    }
  } else {
    productListEl.textContent = '해당 카테고리에 상품이 없습니다.'
  }

  drawFragment(frag)
}

async function drawProductDetail(productId) {
  const frag = document.importNode(templates.productDetail, true)

  const mainImageEl = frag.querySelector('.main-image')
  const titleEl = frag.querySelector('.title')
  const descriptionEl = frag.querySelector('.description')
  const cartFormEl = frag.querySelector('.cart-form')
  const detailImageListEl = frag.querySelector('.detail-image-list')
  const selectEl = frag.querySelector('.option')
  const priceEl = frag.querySelector('.price')
  const quantityEl = frag.querySelector('.quantity')


  const { data: {
    title,
    description,
    mainImgUrl,
    detailImgUrls,
    options
  } } = await api.get(`/products/${productId}`, {
    params: {
      _embed: 'options'
    }
  })

  mainImageEl.setAttribute('src', mainImgUrl)
  titleEl.textContent = title
  descriptionEl.textContent = description

  for (const url of detailImgUrls) {
    const frag = document.importNode(templates.detailImage, true)

    const detailImageEl = frag.querySelector('.detail-image')

    detailImageEl.setAttribute('src', url)

    detailImageListEl.appendChild(frag)
  }

  for (const { id, title, price } of options) {
    const optionEl = document.createElement('option')
    optionEl.setAttribute('value', id)
    optionEl.textContent = `${title} (${price}원)`
    selectEl.appendChild(optionEl)
  }

  function calcluateTotal() {
    const optionId = parseInt(selectEl.value)
    const option = options.find(o => o.id === optionId)

    if (!option) return

    const quantity = parseInt(quantityEl.value)

    const price = option.price * quantity
    priceEl.textContent = `${price.toLocaleString()}원`
  }
  selectEl.addEventListener('change', calcluateTotal)
  quantityEl.addEventListener('input', calcluateTotal)

  cartFormEl.addEventListener('submit', async e => {
    e.preventDefault()
    const optionId = parseInt(selectEl.value)
    const quantity = parseInt(quantityEl.value)

    const { data: orderedCartItems } = await api.get('/cartItems', {
      params: {
        ordered: false,
        optionId
      }
    })
    if (orderedCartItems.length > 0) {
      if (confirm('이미 장바구니에 같은 상품이 존재합니다. 장바구니로 이동하겠습니까?')) {
        drawCartList()
      }
    } else {
      await api.post('/cartItems', {
        optionId,
        quantity,
        ordered: false
      })
      if (confirm('장바구니에 담긴 상품을 확인하시겠습니까?')) {
        drawCartList()
      }
    }
  })

  drawFragment(frag)
}




drawProductList();
