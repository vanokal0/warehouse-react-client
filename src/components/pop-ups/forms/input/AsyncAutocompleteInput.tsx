import { useEffect, useState } from "react";
import { useField, useFormikContext } from "formik";
import styles from "./AsyncAutoCompleteInput.module.css";

type Props = {
  name: string;
  disabled: boolean;
  fetchUrl: string;
};

export default function AsyncAutocompleteInput({
  name,
  disabled,
  fetchUrl,
}: Props) {
  const [field, meta] = useField(name);
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [options, setOptions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetch(fetchUrl)
      .then((res) => res.json())
      .then((data) =>
        setOptions(data.map((item: string | number | Date) => `${item}`))
      )
      .catch(() => setOptions([]));
  }, [fetchUrl]);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes((field.value || "").toLowerCase())
  );

  return (
    <div className={styles["input-container"]}>
      <input
        {...field}
        disabled={disabled}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => {
          // викликаємо вручну, бо Formik може не відмітити як touched
          setFieldTouched(name, true);
          setTimeout(() => setShowDropdown(false), 150);
        }}
        onChange={(e) => setFieldValue(name, e.target.value)}
        className={meta.touched && meta.error ? styles["error-border"] : ""}
      />
      {showDropdown && filtered.length > 0 && (
        <ul>
          {filtered.map((opt) => (
            <li key={opt} onMouseDown={() => setFieldValue(name, opt)}>
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
