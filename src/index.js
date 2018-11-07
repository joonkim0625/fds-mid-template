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
  productDetail: document.querySelector('#product-detail')
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
  // 4. 내용 채우기
  for (const product of productList) {
    const frag = document.importNode(templates.productItem, true);

    const titleEl = frag.querySelector(".product-item-title");
    const mainImgEl = frag.querySelector(".product-item-img");
    mainImgEl.setAttribute("src", product.mainImgUrl);

    titleEl.textContent = product.title;
    mainImgEl.textContent = product.mainImgUrl;

    // 게시물(이미지) 클릭 시 세부 목록으로

    productListEl.appendChild(frag);
  }
  // 5. 이벤트 리스너 등록하기

  // 6. 템플릿을 문서에 삽입

  rootEl.textContent = "";
  rootEl.appendChild(frag);
}
// 상품 상세 정보 그리기
async function drawProductDetail() {
  // 1.
  const frag = document.importNode(templates.productDetail, true)
  // 2.


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
