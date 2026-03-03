import { useEffect, useState } from "react";

export const useUpload = (props) => {
  const previewElementId = props?.previewElementId;

  const initAccept = "image/jpeg, image/png";

  const [accept, setAccept] = useState(initAccept);
  const [file, setFile] = useState(null);
  const [image, setImage] = useState({ url: null });
  const [video, setVideo] = useState({ url: null, duration: null });
  const [pdf, setPdf] = useState({ url: null });
  const [audio, setAudio] = useState({ url: null });
  const [excel, setExcel] = useState({ url: null });
  const [powerpoint, setPowerpoint] = useState({ url: null });

  const handleFileSelect = (file) => {
    const fileIsAnImage = /(image)/i.test(accept);
    const fileIsAVideo = /(video)/i.test(accept);
    const fileIsPDF = /(pdf)/i.test(accept);
    const fileIsAudio = /(audio)/i.test(accept);
    const fileIsExcel = /(csv)/i.test(accept) || /(xlsx)/i.test(accept) || /(xls)/i.test(accept);
    const fileIsPowerpoint = /(ppt|pptx)/i.test(accept) || /powerpoint/i.test(accept);

    if (file) {
      if (fileIsAnImage) {
        const url = URL.createObjectURL(file);
        setImage({ url });
      }

      if (fileIsAVideo) {
        const url = URL.createObjectURL(file);

        setVideo({ url });
      }

      if (fileIsPDF) {
        const url = URL.createObjectURL(file);
        setPdf({ url });
      }

      if (fileIsAudio) {
        const url = URL.createObjectURL(file);
        setAudio({ url });
      }

      if (fileIsExcel) {
        const url = file.name;
        setExcel({ url });
      }

      if (fileIsPowerpoint) {
        const url = file.name;
        setPowerpoint({ url });
      }
    } else {
      setVideo({ url: null });
      setImage({ url: null });
      setPdf({ url: null });
      setAudio({ url: null });
      setExcel({ url: null })
      setPowerpoint({ url: null });
    }

    setFile(file);
  };

  const handleFileDelete = () => {
    setVideo({ url: null });
    setImage({ url: null });
    setPdf({ url: null });
    setAudio({ url: null });
    setExcel({ url: null })
    setPowerpoint({ url: null });

    setFile(null);
  };

  useEffect(() => {
    if (video.url && previewElementId) {
      const videoElement = document.getElementById(previewElementId);

      videoElement.ondurationchange = function () {
        setVideo((prev) => ({ ...prev, duration: this.duration }));
      };
    }
  }, [previewElementId, video.url]);

  const handleInitialImageSelect = (url) => {
    setImage({ url });
  };
  const handleInitialVideoSelect = (url) => {
    setVideo({ url });
  };
  const handleInitialPdfSelect = (url) => {
    setPdf({ url });
  };
  const handleInitialAudioSelect = (url) => {
    setAudio({ url });
  };
  const handleInitialExcelSelect = (url) => {
    setExcel({ url });
  };
  const handleInitialPowerpointSelect = (url) => {
    setPowerpoint({ url });
  };

  const handleAcceptChange = (accept) => setAccept(accept);

  const handleGetFileAndValidate = (label, bypass) => {
    if (!bypass && !image.url && !video.url && !pdf.url && !audio.url && !excel.url && !powerpoint.url)
      throw new Error(`Please upload a ${label}`);

    return file;
  };

  return {
    accept,
    image,
    video,
    pdf,
    audio,
    excel,
    powerpoint,
    file,
    handleFileSelect,
    handleFileDelete,
    handleAcceptChange,
    handleGetFileAndValidate,
    handleInitialImageSelect,
    handleInitialVideoSelect,
    handleInitialPdfSelect,
    handleInitialAudioSelect,
    handleInitialExcelSelect,
    handleInitialPowerpointSelect
  };
};
