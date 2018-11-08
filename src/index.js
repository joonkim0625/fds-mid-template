import "@babel/polyfill"; // 이 라인을 지우지 말아주세요!

import axios from "axios";

const api = axios.create({
  baseURL: process.env.API_URL
});

api.interceptors.request.use(function(config) {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = "Bearer " + token;
  }
  return config;
});

const templates = {
  member: document.querySelector("#member").content,
  loginForm: document.querySelector("#login-form").content,
  productList: document.querySelector("#product-list").content,
  productItem: document.querySelector("#product-item").content,
  productDetail: document.querySelector('#product-detail').content,
  productDetailImg: document.querySelector('#detail-img').content,
  cartItem: document.querySelector('#cart-item').content

};

const rootEl = document.querySelector(".root");

// 페이지 그리는 함수 작성 순서
// 1. 템플릿 복사
// 2. 요소 선택
// 3. 필요한 데이터 불러오기
// 4. 내용 채우기
// 5. 이벤트 리스너 등록하기
// 6. 템플릿을 문서에 삽입

// 시작 화면 페이지
async function mainPage() {
  // 멤버 네비
  memberNav();
  drawProductList();
}

// 멤버 버튼 모은 페이지: memberEl 은 헤더 영역의 nav tag를 선택하기 위한
const memberEl = document.querySelector(".member");

async function memberNav() {
  const frag = document.importNode(templates.member, true);

  // 로그인 버튼 클릭 시
  frag.querySelector(".member-login").addEventListener("click", e => {
    drawLoginForm();
  });

  // 로그아웃 버튼 클릭 시
  frag.querySelector('.member-logout').addEventListener('click', e => {
    localStorage.removeItem('token')
    mainPage()
  })


  memberEl.textContent = "";
  memberEl.appendChild(frag);
}

// 로그인 화면 그리는 함수
async function drawLoginForm() {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.loginForm, true);
  const memberFrag = document.importNode(templates.member, true);

  // 2. 요소 선택
  const formEl = frag.querySelector(".login-form");

  // 5. 이벤트 리스너 등록하기
  formEl.addEventListener("submit", async e => {
    e.preventDefault();
    const username = e.target.elements.username.value;
    const password = e.target.elements.password.value;

    const res = await api.post("/users/login", {
      username,
      password
    });

    localStorage.setItem("token", res.data.token);
    if (res.status === 200) {
      memberFrag.querySelector('.member-btns').classList.add('user-in')
    }
    mainPage();
  });

  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = "";
  rootEl.appendChild(frag);
}

// 상품 목록 그리는 함수
async function drawProductList() {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.productList, true);

  // 2. 요소 선택
  const productListEl = frag.querySelector(".product-list");
  // 3. 필요한 데이터 불러오기
  const res = await api.get("/products");
  const productList = res.data;

  // 상품 세부 내용을 보여주기 위한 데이터 불러오기

  // 4. 내용 채우기
  for (const product of productList) {
    const frag = document.importNode(templates.productItem, true);

    const titleEl = frag.querySelector(".product-item-title");
    const mainImgEl = frag.querySelector(".product-item-img");
    mainImgEl.setAttribute("src", product.mainImgUrl);

    titleEl.textContent = product.title;


    // 게시물(이미지) 클릭 시 세부 목록으로
    mainImgEl.addEventListener('click', e => {
      drawProductDetail(product.id)
    })

    productListEl.appendChild(frag);
  }
  // 5. 이벤트 리스너 등록하기

  // 6. 템플릿을 문서에 삽입

  rootEl.textContent = "";
  rootEl.appendChild(frag);
}
// 상품 상세 정보 그리기
async function drawProductDetail(productId) {
  // 1.

  const frag = document.importNode(templates.productDetail, true)
  // 2.
  const titleEl = frag.querySelector('.title')
  const mainImgEl = frag.querySelector('.main-img')
  const detailImgListEl = frag.querySelector('.detail-img-list')
  const categoryEl = frag.querySelector('.category')
  const descriptionEl = frag.querySelector('.description')
  const backEl = frag.querySelector('.back')
  const cartFormEl = frag.querySelector('.cart-form')
  const selectEl = frag.querySelector('.option')
  const totalPriceEl = frag.querySelector('.total-price')


  // 3.
  const {data: {title, category, description, mainImgUrl, detailImgUrls, options}} = await api.get('/products/' + productId, {
    params: {
      _embed: 'options'
    }
  })


  // 4.

  mainImgEl.setAttribute('src', mainImgUrl)
  titleEl.textContent = title
  categoryEl.textContent = category
  descriptionEl.textContent = description

  // 세부이미지 표시를 위한 for문
  for (const url of detailImgUrls) {
    const frag = document.importNode(templates.productDetailImg, true)

    const detailImgEl = frag.querySelector('.detail-img')

    detailImgEl.setAttribute('src', url)
    detailImgListEl.appendChild(frag)
  }
  // options 안의 내용들을 불러오기 위한 for문
  for (const optionList of options) {

    // 불러온 걸 template.productDetail 안에 추가...
    const optionEl = document.createElement('option')
    optionEl.setAttribute('value', 'optionList.id')
    optionEl.textContent = optionList.title
    selectEl.appendChild(optionEl)

   totalPriceEl.textContent = optionList.price

  }
  // 5.
  backEl.addEventListener('click', e => {
    mainPage()
  })

  // formEl.addEventListener('submit', async e => {
  //   e.preventDefault()
  //   // const optionId = e.target.elements.option.value
  //   // const quantity = e.target.elements.quantity.value

  //   // api.post('/cartItems', {optionId...}) -> parseInt 변환 후 전송
  // })
  // 6.
  rootEl.textContent = ''
  rootEl.appendChild(frag)
}

// 로그인 화면 그리기
async function drawLoginForm() {
  // 1
  const frag = document.importNode(templates.loginForm, true);

  // 2
  const formEl = frag.querySelector(".login-form");

  // 5
  formEl.addEventListener("submit", async e => {
    e.preventDefault();
    const username = e.target.elements.username.value;
    const password = e.target.elements.password.value;

    const res = await api.post("/users/login", {
      username,
      password
    });

    localStorage.setItem("token", res.data.token);
    drawProductList();
  });

  // 6
  rootEl.textContent = "";
  rootEl.appendChild(frag);
}

mainPage();
