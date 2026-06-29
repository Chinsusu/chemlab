import type { Lesson } from "@/lessons/schema";

export const phanUngTaoNuoc: Lesson = {
  id: "phan-ung-tao-nuoc",
  question: "Hydrogen trong Mặt trời có liên quan gì đến nước?",
  topicTags: ["vu-tru", "vat-chat", "doi-thuong"],
  difficulty: 1,
  meta: {
    sgkSources: [
      "KHTN 8 KNTT - Chương 1, Bài 2: Phản ứng hóa học",
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
      "Nêu được khái niệm phản ứng hóa học",
      "Nêu được chất tham gia và chất sản phẩm",
      "Nêu được dấu hiệu nhận biết có phản ứng hóa học xảy ra"
    ],
    objectives: [
      "Nêu được phản ứng hóa học là quá trình biến đổi chất tham gia thành sản phẩm.",
      "Xác định được hydrogen, oxygen là chất tham gia và nước là sản phẩm.",
      "Viết và đọc được PTHH: 2H₂ + O₂ → 2H₂O."
    ],
    prerequisites: ["chat-nguyen-tu-phan-tu-co-ban"],
    outOfCurriculum: [
      "Mặt trời sinh năng lượng bằng phản ứng nhiệt hạch, không phải phản ứng hóa học."
    ]
  },
  steps: [
    {
      type: "hook",
      title: "Hydrogen trong Mặt trời có liên quan gì đến nước?",
      body:
        "Hydrogen là nguyên tố phổ biến nhất vũ trụ và là nhiên liệu của Mặt trời. Nhưng Mặt trời sinh năng lượng bằng phản ứng nhiệt hạch, không phải phản ứng hóa học. Trên Trái Đất, hydrogen có thể kết hợp với oxygen tạo thành nước.",
      facts: [
        "Hydrogen là nguyên tố nhẹ nhất.",
        "Mặt trời chủ yếu gồm hydrogen và helium.",
        "Phản ứng tạo nước là ví dụ điển hình của phản ứng hóa học."
      ],
      animation: "sun",
      curriculumScope: "outOfCurriculum",
      estimatedMinutes: 1,
      sgkChip: "Ngoài chương trình: Mặt trời & nhiệt hạch",
      challenge: {
        id: "sun-fusion-not-burning",
        type: "predict",
        prompt: "Đoán trước khi mở giải thích.",
        predict: {
          prompt: "Mặt trời có sinh năng lượng bằng phản ứng H₂ + O₂ tạo nước không?",
          options: [
            "Có, giống phản ứng tạo nước",
            "Không, đó là phản ứng nhiệt hạch",
            "Có, vì Mặt trời có hydrogen"
          ],
          correctIndex: 1,
          allowWrongToReveal: true
        },
        successCriteria: { kind: "choice", correctIndex: 1 },
        feedback: {
          onWrong:
            "Chưa đúng: Mặt trời dùng phản ứng nhiệt hạch, còn phản ứng H₂ + O₂ tạo nước là phản ứng hóa học trên Trái Đất."
        },
        explanation:
          "Mặt trời sinh năng lượng bằng phản ứng hạt nhân, không phải phản ứng hóa học H₂ + O₂. Bài này dùng hydrogen trong Mặt trời làm cửa vào để học phần SGK: trên Trái Đất, hydrogen kết hợp oxygen tạo nước.",
        misconceptionCheck: true,
        telemetry: { events: ["predictChoice", "revealOpened", "timeOnTask"] }
      }
    },
    {
      type: "concept",
      title: "Phản ứng hóa học là gì?",
      body:
        "Phản ứng hóa học là quá trình chất tham gia biến đổi thành chất sản phẩm. Trong bài này, ta theo dõi một ví dụ rất gọn: hydrogen và oxygen biến đổi thành nước.",
      animation: "h-atom",
      curriculumScope: "core",
      estimatedMinutes: 2,
      sgkChip: "KHTN 8: Phản ứng hóa học",
      challenge: {
        id: "combine-reactants-product",
        type: "manipulate",
        prompt: "Chạm đủ hai chất tham gia để thấy sản phẩm.",
        interactive: {
          id: "combine",
          params: {
            reactants: [
              { formula: "H2", label: "Hydrogen" },
              { formula: "O2", label: "Oxygen" }
            ],
            product: { formula: "H2O", label: "Nước" }
          }
        },
        successCriteria: { kind: "target", goal: { product: "H2O" } },
        explanation:
          "Hydrogen và oxygen là chất tham gia. Sau phản ứng, chất mới xuất hiện là nước. Đó là ý chính của phản ứng hóa học: chất tham gia biến đổi thành sản phẩm.",
        misconceptionCheck: false,
        telemetry: { events: ["attempt", "solved", "timeOnTask"], objectiveRef: 0 }
      }
    },
    {
      type: "reaction",
      title: "Hydrogen + oxygen → nước",
      reactants: [
        { formula: "H2", coefficient: 2, atomCounts: { H: 2 } },
        { formula: "O2", coefficient: 1, atomCounts: { O: 2 } }
      ],
      products: [{ formula: "H2O", coefficient: 2, atomCounts: { H: 2, O: 1 } }],
      displayEquation: "2H₂ + O₂ → 2H₂O",
      safetyNote:
        "Đây là mô phỏng trên máy, không phải hướng dẫn làm thí nghiệm. Không tự thử ở nhà. Hỗn hợp hydrogen và oxygen có thể gây nổ; thí nghiệm thật phải có giáo viên và phòng thí nghiệm an toàn.",
      curriculumScope: "core",
      estimatedMinutes: 2,
      sgkChip: "KHTN 8: Chất tham gia → sản phẩm",
      challenge: {
        id: "water-reaction-mix",
        type: "manipulate",
        prompt: "Chỉnh tỉ lệ đúng để không dư chất nào, rồi cho phản ứng.",
        predict: {
          prompt: "Mỗi O₂ cần mấy H₂ để tạo nước trọn vẹn?",
          options: ["1 H₂", "2 H₂", "3 H₂"],
          correctIndex: 1,
          allowWrongToReveal: true
        },
        interactive: {
          id: "ratio-mixer",
          params: {
            reactants: [
              { formula: "H2", label: "H₂", atomCounts: { H: 2 } },
              { formula: "O2", label: "O₂", atomCounts: { O: 2 } }
            ],
            product: { formula: "H2O", label: "H₂O", atomCounts: { H: 2, O: 1 } },
            range: { min: 0, max: 6 }
          }
        },
        successCriteria: { kind: "target", goal: { product: "H2O", noLeftover: true } },
        feedback: {
          byMode: {
            missingReactant: "Cần cả hydrogen và oxygen mới có phản ứng.",
            leftoverH2: "Dư hydrogen — quá nhiều H₂ so với O₂.",
            leftoverO2: "Dư oxygen — mỗi O₂ cần 2 H₂."
          }
        },
        explanation:
          "Tỉ lệ 2 H₂ : 1 O₂ tạo nước không dư: 2H₂ + O₂ → 2H₂O. Số nguyên tử hai vế bằng nhau: H là 4=4, O là 2=2.",
        misconceptionCheck: false,
        telemetry: {
          events: ["predictChoice", "attempt", "wrongOption", "solved", "timeOnTask"],
          objectiveRef: 2
        }
      }
    },
    {
      type: "realworld",
      title: "Vì sao điều này đáng nhớ?",
      items: [
        {
          icon: "water",
          label: "Nước quanh ta",
          note: "Nước là sản phẩm quen thuộc giúp ta nhìn thấy ý nghĩa của từ 'sản phẩm' trong phản ứng."
        },
        {
          icon: "safety",
          label: "An toàn thí nghiệm",
          note: "Cùng một phản ứng có thể đẹp trên mô phỏng nhưng nguy hiểm nếu làm sai ngoài đời."
        }
      ],
      curriculumScope: "core",
      estimatedMinutes: 1,
      sgkChip: "KHTN 8: Dấu hiệu và ý nghĩa phản ứng",
      challenge: {
        id: "realworld-safety-meaning",
        type: "explore",
        prompt: "Mở cả hai thẻ để chốt ý nghĩa và an toàn.",
        successCriteria: { kind: "exploreCount", min: 2 },
        explanation:
          "Cùng một phản ứng có thể giúp ta hiểu khái niệm sản phẩm trong SGK, nhưng ngoài đời cần điều kiện an toàn nghiêm ngặt.",
        misconceptionCheck: false,
        telemetry: { events: ["attempt", "solved", "timeOnTask"], objectiveRef: 0 }
      }
    },
    {
      type: "quiz",
      curriculumScope: "core",
      estimatedMinutes: 1,
      sgkChip: "KHTN 8: Kiểm tra nhanh",
      challenge: {
        id: "water-reaction-recall",
        type: "recall",
        prompt: "Trả lời 3 câu để hoàn thành bài.",
        successCriteria: { kind: "answerAll", minCorrect: 0 },
        explanation:
          "Bài hoàn thành khi em đã trả lời đủ câu hỏi. Điểm chính chỉ tính mục tiêu SGK; câu Mặt trời được tách riêng để kiểm tra hiểu nhầm.",
        misconceptionCheck: false,
        telemetry: { events: ["attempt", "wrongOption", "solved", "timeOnTask"] }
      },
      questions: [
        {
          q: "Trong phản ứng tạo nước, đâu là chất sản phẩm?",
          options: ["Hydrogen", "Oxygen", "Nước", "Mặt trời"],
          answerIndex: 2,
          mapsToObjective: 1,
          feedback: "Đúng: hydrogen và oxygen là chất tham gia, nước là sản phẩm."
        },
        {
          q: "PTHH cân bằng của phản ứng tạo nước là gì?",
          options: ["H₂ + O₂ → H₂O", "2H₂ + O₂ → 2H₂O", "H + O → HO", "2H₂O → 2H₂ + O₂"],
          answerIndex: 1,
          mapsToObjective: 2,
          feedback: "Đúng: hai phân tử H₂ kết hợp với một phân tử O₂ tạo hai phân tử H₂O."
        },
        {
          q: "Mặt trời có cháy bằng phản ứng H₂ + O₂ không?",
          options: [
            "Có, giống phản ứng tạo nước",
            "Không, Mặt trời dùng phản ứng nhiệt hạch",
            "Có, vì Mặt trời có hydrogen",
            "Không, vì Mặt trời không có hydrogen"
          ],
          answerIndex: 1,
          mapsToObjective: -1,
          isMisconceptionCheck: true,
          feedback:
            "Đúng: Mặt trời sinh năng lượng bằng phản ứng hạt nhân. Phản ứng H₂ + O₂ là phản ứng hóa học trên Trái Đất."
        }
      ]
    }
  ]
};
