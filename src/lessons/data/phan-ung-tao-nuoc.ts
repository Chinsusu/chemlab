import type { Lesson } from "@/lessons/schema";

export const phanUngTaoNuoc: Lesson = {
  id: "phan-ung-tao-nuoc",
  question: "Hydrogen trong Mat troi co lien quan gi den nuoc?",
  topicTags: ["vu-tru", "vat-chat", "doi-thuong"],
  difficulty: 1,
  meta: {
    sgkSources: [
      "KHTN 8 KNTT - Chuong 1, Bai 2: Phan ung hoa hoc",
      "https://vietjack.com/khoa-hoc-tu-nhien-8-kn/bai-2-phan-ung-hoa-hoc.jsp"
    ],
    author: "ChemLab",
    status: "review",
    hasSafetyWarning: true
  },
  sgkMatrix: {
    grade: 8,
    books: ["KNTT"],
    standards: [
      "Neu duoc khai niem phan ung hoa hoc",
      "Neu duoc chat tham gia va chat san pham",
      "Neu duoc dau hieu nhan biet co phan ung hoa hoc xay ra"
    ],
    objectives: [
      "Neu duoc phan ung hoa hoc la qua trinh bien doi chat tham gia thanh san pham.",
      "Xac dinh duoc hydrogen, oxygen la chat tham gia va nuoc la san pham.",
      "Viet va doc duoc PTHH: 2H2 + O2 -> 2H2O."
    ],
    prerequisites: ["chat-nguyen-tu-phan-tu-co-ban"],
    outOfCurriculum: [
      "Mat troi sinh nang luong bang phan ung nhiet hach, khong phai phan ung hoa hoc."
    ]
  },
  steps: [
    {
      type: "hook",
      title: "Hydrogen trong Mat troi co lien quan gi den nuoc?",
      body:
        "Hydrogen la nguyen to pho bien nhat vu tru va la nhien lieu cua Mat troi. Nhung Mat troi sinh nang luong bang phan ung nhiet hach, khong phai phan ung hoa hoc. Tren Trai Dat, hydrogen co the ket hop voi oxygen tao thanh nuoc.",
      facts: [
        "Hydrogen la nguyen to nhe nhat.",
        "Mat troi chu yeu gom hydrogen va helium.",
        "Phan ung tao nuoc la vi du dien hinh cua phan ung hoa hoc."
      ],
      animation: "sun",
      curriculumScope: "outOfCurriculum",
      estimatedMinutes: 1,
      sgkChip: "Ngoai chuong trinh: Mat troi & nhiet hach"
    },
    {
      type: "concept",
      title: "Phan ung hoa hoc la gi?",
      body:
        "Phan ung hoa hoc la qua trinh chat tham gia bien doi thanh chat san pham. Trong bai nay, ta theo doi mot vi du rat gon: hydrogen va oxygen bien doi thanh nuoc.",
      animation: "h-atom",
      curriculumScope: "core",
      estimatedMinutes: 2,
      sgkChip: "KHTN 8: Phan ung hoa hoc"
    },
    {
      type: "reaction",
      title: "Hydrogen + oxygen -> nuoc",
      reactants: [
        { formula: "H2", coefficient: 2, atomCounts: { H: 2 } },
        { formula: "O2", coefficient: 1, atomCounts: { O: 2 } }
      ],
      products: [{ formula: "H2O", coefficient: 2, atomCounts: { H: 2, O: 1 } }],
      displayEquation: "2H2 + O2 -> 2H2O",
      safetyNote:
        "Day la mo phong tren may, khong phai huong dan lam thi nghiem. Khong tu thu o nha. Hon hop hydrogen va oxygen co the gay no; thi nghiem that phai co giao vien va phong thi nghiem an toan.",
      interactive: "ratio-mixer",
      curriculumScope: "core",
      estimatedMinutes: 2,
      sgkChip: "KHTN 8: Chat tham gia -> san pham"
    },
    {
      type: "realworld",
      title: "Vi sao dieu nay dang nho?",
      items: [
        {
          icon: "water",
          label: "Nuoc quanh ta",
          note: "Nuoc la san pham quen thuoc giup ta nhin thay y nghia cua tu 'san pham' trong phan ung."
        },
        {
          icon: "safety",
          label: "An toan thi nghiem",
          note: "Cung mot phan ung co the dep tren mo phong nhung nguy hiem neu lam sai ngoai doi."
        }
      ],
      curriculumScope: "core",
      estimatedMinutes: 1,
      sgkChip: "KHTN 8: Dau hieu va y nghia phan ung"
    },
    {
      type: "quiz",
      curriculumScope: "core",
      estimatedMinutes: 1,
      sgkChip: "KHTN 8: Kiem tra nhanh",
      questions: [
        {
          q: "Trong phan ung tao nuoc, dau la chat san pham?",
          options: ["Hydrogen", "Oxygen", "Nuoc", "Mat troi"],
          answerIndex: 2,
          mapsToObjective: 1,
          feedback: "Dung: hydrogen va oxygen la chat tham gia, nuoc la san pham."
        },
        {
          q: "PTHH can bang cua phan ung tao nuoc la gi?",
          options: ["H2 + O2 -> H2O", "2H2 + O2 -> 2H2O", "H + O -> HO", "2H2O -> 2H2 + O2"],
          answerIndex: 1,
          mapsToObjective: 2,
          feedback: "Dung: hai phan tu H2 ket hop voi mot phan tu O2 tao hai phan tu H2O."
        },
        {
          q: "Mat troi co chay bang phan ung H2 + O2 khong?",
          options: [
            "Co, giong phan ung tao nuoc",
            "Khong, Mat troi dung phan ung nhiet hach",
            "Co, vi Mat troi co hydrogen",
            "Khong, vi Mat troi khong co hydrogen"
          ],
          answerIndex: 1,
          mapsToObjective: -1,
          isMisconceptionCheck: true,
          feedback:
            "Dung: Mat troi sinh nang luong bang phan ung hat nhan. Phan ung H2 + O2 la phan ung hoa hoc tren Trai Dat."
        }
      ]
    }
  ]
};
