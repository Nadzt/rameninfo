import React, { useCallback, useEffect, useState } from "react";
import { CheckBox, RamenStore, Eaten, ControlOption } from "../../common/types";
import ramenStores from "../../assets/awesome.json";
import {
  strName,
  strOpening,
  strReservation,
  strTags,
  strWaiting,
} from "../../common/constants";

type Props = {
  updateCheckList: (checkList: Array<CheckBox>) => void;
  controlOption: ControlOption;
};

function DataPanel(props: Props) {
  const [checkList, setCheckList] = useState<Array<CheckBox>>(() => {
    const savedCheckList = JSON.parse(
      window.localStorage.getItem("checkList") || "[]"
    );
    if (savedCheckList.length === ramenStores.length) {
      return savedCheckList;
    }
    return Array.from({ length: ramenStores.length }, (_, idx) => {
      return { id: idx, value: false, isHidden: false } as CheckBox;
    });
  });
  const [isHidden, setIsHidden] = useState(
    Array<boolean>(checkList.length).fill(false)
  );

  const updateVisible = useCallback(() => {
    const controlOption = props.controlOption;
    return checkList
      .map((checkBox: CheckBox) => {
        const checked = checkBox.value;
        switch (controlOption.eaten) {
          case Eaten.Default:
            return false;
          case Eaten.Yes:
            return !checked;
          case Eaten.No:
            return checked;
        }
      })
      .map((isHidden: boolean, idx: number) => {
        if (isHidden) return true;
        return !Object.values(ramenStores[idx])
          .join()
          .includes(controlOption.search);
      });
  }, [props.controlOption, checkList]);

  useEffect(() => {
    setIsHidden(updateVisible);
    window.localStorage.setItem("checkList", JSON.stringify(checkList));
    const newCheckList = [...checkList].map(
      (checkBox: CheckBox, idx: number) => {
        checkBox.isHidden = isHidden[idx];
        return checkBox;
      }
    );
    props.updateCheckList(newCheckList);
  }, [updateVisible]);

  useEffect(() => {
    document.querySelector("#skeleton")?.classList.add("u-hidden");
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    setCheckList((checkList) => {
      const newCheckList = [...checkList];
      newCheckList[idx].value = event.target.checked;
      return newCheckList;
    });
  };

  return (
    <div className="ts-box">
      <table className="ts-table is-celled is-striped">
        <thead>
          <tr>
            <th className="is-collapsed"></th>
            <th className="is-collapsed mobile:u-hidden">{strOpening}</th>
            <th>{strName}</th>
            <th>{strReservation}</th>
            <th>{strWaiting}</th>
            <th className="mobile:u-hidden">{strTags}</th>
          </tr>
        </thead>
        <tbody id="ramen-info-list">
          {ramenStores.map((ramenStore: RamenStore, idx: number) => {
            return (
              <tr
                id={"ramen-info-item-" + idx}
                className={isHidden[idx] ? "u-hidden" : ""}
                key={idx}
              >
                <td>
                  <label className="ts-checkbox">
                    <input
                      type="checkbox"
                      checked={checkList[idx].value}
                      onChange={(e) => {
                        handleChange(e, idx);
                      }}
                    />
                  </label>
                </td>
                <td className="mobile:u-hidden">
                  <span className="ts-icon is-battery-full-icon"></span>
                </td>
                <td>
                  <a
                    href={ramenStore.googleMap}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {ramenStore.name}
                  </a>
                </td>
                <td>{ramenStore.reservation || "N/A"}</td>
                <td>{ramenStore.waiting || "N/A"}</td>
                <td className="mobile:u-hidden">{ramenStore.tags || "N/A"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="ts-wrap is-center-aligned">
        <div id="skeleton" className="ts-loading"></div>
      </div>
    </div>
  );
}

export default DataPanel;
