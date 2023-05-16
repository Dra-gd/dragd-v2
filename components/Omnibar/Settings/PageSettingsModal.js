import React, { useState } from "react";
import GenericModal from "../../UI/GenericModal";
import { ErrorText } from "../../ui-helpers";
import { deleteSite, updateSite } from "../../DataProvider";
import { useRouter } from "next/navigation";
import { DeployToIpfs } from "./SiteSettings";
import KVPEditor from "./KVPEditor";

const pages = ["Page Settings", "Site Settings", "Delete"];
export default function PageSettingsModal({ siteData, onComplete }) {
  const [page, setPage] = useState(pages[0]);
  return (
    <GenericModal onDone={() => onComplete()}>
      <div className="card-actions justify-end -mx-2 -mt-4">
        <button
          onClick={() => {
            onComplete();
          }}
          className="btn btn-square btn-xs"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="tabs w-full -mt-5 mb-3">
        {pages.map((item, index) => {
          return (
            <a
              className={`tab tab-bordered ${item == page ? "tab-active" : ""}`}
              onClick={() => setPage(item)}
            >
              {item}
            </a>
          );
        })}
        <a className="cursor-default tab tab-bordered flex grow pointer-events-none"></a>
      </div>

      {page == pages[0] && (
        <>
          <div className={"flex flex-col items-center space-y-2"}>
            <NameUpdater siteData={siteData} />
            <HeadUpdater siteData={siteData} />
            <DevTools siteData={siteData} />
          </div>
        </>
      )}

      {page == pages[1] && (
        <>
          <div className="alert shadow-xs p-2 text-xs">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-info flex-shrink-0 w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>
                Site settings affect all pages under <b>{siteData.siteName}</b>
              </span>
            </div>
          </div>
          <div className={"flex flex-col items-center space-y-2"}>
            <DeployToIpfs siteData={siteData} />
          </div>
        </>
      )}

      {page == pages[2] && (
        <>
          <div className={"flex flex-col items-center space-y-2"}>
            <DeletePage siteData={siteData} onComplete={onComplete} />
          </div>
        </>
      )}
    </GenericModal>
  );
}

const NameUpdater = ({ siteData }) => {
  const router = useRouter();

  const [pageName, setPageName] = React.useState(siteData.pageName);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const updateSiteSubmit = async () => {
    setLoading(true);
    const updatedSite = {
      ...siteData,
      pageName,
    };

    var query = updateSite(siteData._id, updatedSite);

    query
      .then((result) => {
        setError(null);
        setLoading(false);
        router.push(updatedSite.siteName + "/" + updatedSite.pageName);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  };
  return (
    <>
      <div className="w-full">
        <label className="label w-full">
          <span className="label-text text-lg">Page Name</span>
        </label>
        <label className="input-group input-group-sm flex flex-row justify-center">
          <span className="input input-bordered input-sm">
            {trimIfLongerThan(siteData.siteName, 10)}/
          </span>
          <input
            type="text"
            className="input input-bordered input-sm"
            placeholder="your page name"
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
          />
          {pageName != siteData.pageName ? (
            <button
              onClick={async () => updateSiteSubmit()}
              className={`btn btn-sm ${loading ? "loading" : ""}`}
            >
              Save
            </button>
          ) : null}
        </label>
      </div>

      {error && <ErrorText>{error}</ErrorText>}
    </>
  );
};

const HeadUpdater = ({ siteData }) => {
  const [head, setHead] = React.useState(
    siteData.page.head || {
      title: "My Dragd Page",
      description: "",
      keywords: "",
      image: "",
    }
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const updateSiteSubmit = async (newHead) => {
    setLoading(true);

    const updatedSite = {
      ...siteData,
      page: {
        ...siteData.page,
        head: { ...newHead, type: "head" },
      },
    };

    var query = updateSite(siteData._id, updatedSite);

    query.then((result) => {
      setError(null);
      setLoading(false);
    });
  };
  return (
    <>
      <label className="label w-full">
        <span className="label-text text-lg">Headers</span>
      </label>{" "}
      <KVPEditor
        initialObject={head}
        loading={loading}
        onSubmit={async (updatedObject) => {
          await updateSiteSubmit(updatedObject);
        }}
      />
      {error && <ErrorText>{error}</ErrorText>}
    </>
  );
};

const trimIfLongerThan = (str, maxLength) => {
  return str.length > maxLength ? "..." + str.slice(-maxLength) : str;
};

const DevTools = ({ siteData }) => {
  const [showCode, setShowCode] = React.useState(false);

  return (
    <>
      <div className="w-full text-right">
        <button
          className={`rounded-sm ${showCode ? "bg-slate-300" : ""}`}
          onClick={() => setShowCode(!showCode)}
        >
          ⚙️
        </button>
      </div>
      {showCode && (
        <div className="mockup-code text-left w-full overflow-x-scroll">
          <pre className="max-h-60 overflow-y-scroll overflow-x-hidden ">
            {JSON.stringify(siteData, null, 2)}
          </pre>
        </div>
      )}
    </>
  );
};

const DeletePage = ({ siteData, onComplete }) => {
  const [error, setError] = React.useState(null);
  const router = useRouter();
  const deleteSiteSubmit = async (id) => {
    var query = deleteSite({ id });
    query
      .then((result) => {
        router.push("/" + siteData.siteName);
        onComplete();
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <div className={"flex flex-col items-center w-full mt-6"}>
      <span className="text-lg">
        Are you sure you want to delete {siteData.pageName}?
      </span>
      <span className="text-xs mb-6">
        It cannot be recovered in the editor.
      </span>

      <button
        className="btn btn-error w-36 mt-3 mb-5"
        onClick={(e) => {
          deleteSiteSubmit(siteData._id);
        }}
      >
        Delete Page
      </button>
      {error}
    </div>
  );
};
