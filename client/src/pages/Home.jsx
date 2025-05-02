import { FaLightbulb, FaUsers } from "react-icons/fa";
import jumbotron from "../assets/1.png";

function HomePage() {
  return (
    <>
      <div className="relative isolate overflow-x-hidden overflow-hidden px-6 py-8 sm:py-8 lg:px-8 lg:py-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <svg
            className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="e813992c-7d03-4cc4-a2bd-151760b470a0"
                width={200}
                height={200}
                x="50%"
                y={-1}
                patternUnits="userSpaceOnUse"
              >
                <path d="M100 200V.5M.5 .5H200" fill="none" />
              </pattern>
            </defs>
            <svg x="50%" y={-1} className="overflow-visible fill-gray-50">
              <path
                d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
                strokeWidth={0}
              />
            </svg>
            <rect
              width="100%"
              height="100%"
              strokeWidth={0}
              fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)"
            />
          </svg>
        </div>
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-7xl lg:grid-cols-2 lg:items-start lg:gap-y-12">
          <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
            <div className="lg:pr-6">
              <div className="lg:max-w-lg">
                <p className="text-base font-semibold text-blue-600">
                  No Delay, No Deny, No Defend with
                </p>
                <h1 className="text-6xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  TrueCare
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-800">
                  Revolutionize healthcare reimbursement with our AI-powered
                  solution. TrueCare AI utilizes advanced machine learning to
                  process claims, analyze medical documents, ensure compliance,
                  and detect fraud, delivering unparalleled speed, accuracy, and
                  reliability.{" "}
                </p>
              </div>
            </div>
          </div>
          <div className="lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:overflow-hidden">
            <img
              className="pointer-events-none select-none object-cover scale-105"
              src={jumbotron}
              alt="TrueCare AI in Action"
            />
          </div>
          <div className="lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:mx-auto lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
            <div className="lg:pr-6">
              <div className="max-w-xl text-base leading-7 text-gray-600 lg:max-w-lg">
                {/* Statistics Section */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-10">
                  <div>
                    <p className="text-3xl font-bold text-yellow-500">4+</p>
                    <p className="text-gray-600 text-xs font-medium">
                      Insurers Partnered
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-500">50+</p>
                    <p className="text-gray-600 text-xs font-medium">
                      Doctors Connected
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-yellow-600">~80%</p>
                    <p className="text-gray-600 text-xs font-medium">
                      ML Efficiency
                    </p>
                  </div>
                </div>

                {/* Features List */}
                <ul role="list" className="text-gray-600 space-y-5">
                  <li className="flex gap-x-4">
                    <FaLightbulb
                      className="mt-1 h-5 w-5 flex-none text-yellow-500"
                      aria-hidden="true"
                    />
                    <span>
                      <strong className="font-semibold text-gray-900">
                        Intelligent Processing
                      </strong>{" "}
                      Precision-driven ML algorithms ensure fast and accurate
                      claim analysis.
                    </span>
                  </li>
                  <li className="flex gap-x-4">
                    <FaUsers
                      className="mt-1 h-5 w-5 flex-none text-blue-500"
                      aria-hidden="true"
                    />
                    <span>
                      <strong className="font-semibold text-gray-900">
                        Seamless Ecosystem
                      </strong>{" "}
                      Connects insurers, healthcare providers, and patients effortlessly.
                    </span>
                  </li>
                </ul>

                {/* Buttons */}
                <div className="mt-10 flex gap-4 flex-wrap">
                  <a
                    href="/insurer/login"
                    className="rounded-md px-5 py-2.5 text-sm font-semibold text-yellow-800 shadow-md border border-gray-300 hover:bg-gray-100 transition-all duration-200"
                  >
                    Insurer Portal
                  </a>
                  <a
                    href="/doctor/login"
                    className="rounded-md px-5 py-2.5 text-sm font-semibold text-blue-800 shadow-md border border-gray-300 hover:bg-gray-100 transition-all duration-200"
                  >
                    Doctor Portal
                  </a>
                  <a
                    href="/client/login"
                    className="rounded-md px-5 py-2.5 text-sm font-semibold text-green-800 shadow-md border border-gray-300 hover:bg-gray-100 transition-all duration-200"
                  >
                    Client Portal
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
