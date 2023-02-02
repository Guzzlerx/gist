import React, {
  ChangeEvent,
  FormEvent,
  MouseEvent,
  useCallback,
  useRef,
  useState,
} from 'react';

import { Loader } from 'semantic-ui-react';
import { v4 as uuidv4 } from 'uuid';

import addFileIcon from '../../assets/icons/add_file.svg';
import crossIcon from '../../assets/icons/closingCross.svg';
import imageCross from '../../assets/icons/previewImageCross.svg';
import { createPost, getPosts } from '../../redux/actions/postsActions';
import { useAppDispatch, useAppSelector } from '../../utils/redux-utils';
import AudioFile from '../AudioFile/AudioFile';
import DocFile from '../DocFile/DocFile';
import FullScreen from '../FullScreen/FullScreen';
import CustomButton from '../UI/CustomButton/CustomButton';
import VideoFile from '../VideoFile/VideoFile';

import styles from './CreatePostBlock.module.css';

type CreatePostBlockTypes = {
  profileName?: string;
  profileNickname?: string;
  profileAvatar?: string;
  isActive: boolean;
  closeCallback: () => void;
};

type TemporaryContainerTypes = {
  image: number;
  video: number;
  audio: number;
  application: number;
};

type FileTypes = {
  id: string;
  name: string;
  src: string;
  type?: string;
  file: string | Blob;
};

const CreatePostBlock: React.FC<CreatePostBlockTypes> = ({
  profileName,
  profileNickname,
  profileAvatar,
  isActive,
  closeCallback,
}) => {
  const [textInput, setTextInput] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<FileTypes[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<FileTypes[]>([]);
  const [selectedAudios, setSelectedAudios] = useState<FileTypes[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<FileTypes[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [currentImage, setCurrentImage] = useState<string>('');
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { token, userProfileId } = useAppSelector(state => state.auth);

  const dispatch = useAppDispatch();

  const filePicker = useRef<HTMLInputElement>(null);

  const onChangeTextHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(e.target.value);
  };

  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();

    const finalArray = [
      ...selectedImages,
      ...selectedVideos,
      ...selectedAudios,
      ...selectedDocs,
    ];

    finalArray.forEach(el => {
      formData.append('files', el.file);
    });

    formData.append('description', textInput);

    setIsLoading(true);

    const response = await dispatch(createPost({ formData, token }));

    setIsLoading(false);

    if (response.error) {
      setErrorMessage('An error occurred while sending the request...');

      return;
    }

    dispatch(
      getPosts({
        userProfileId,
        limit: 20,
        offset: 0,
        type: 'all',
        token,
      }),
    );

    closeCallback();
  };

  const onDeleteImageHandler = useCallback(
    (id: string) => setSelectedImages(state => state.filter(el => el.id !== id)),
    [selectedImages],
  );

  const onDeleteVideoHandler = useCallback(
    (id: string) => setSelectedVideos(state => state.filter(el => el.id !== id)),
    [selectedVideos],
  );

  const onDeleteAudioHandler = useCallback(
    (id: string) => setSelectedAudios(state => state.filter(el => el.id !== id)),
    [selectedAudios],
  );

  const onDeleteDocHandler = useCallback(
    (id: string) => setSelectedDocs(state => state.filter(el => el.id !== id)),
    [selectedDocs],
  );

  const onAddButtonClick = () => {
    filePicker?.current?.click();
  };

  const onCloseBlockHandler = () => {
    closeCallback();

    setErrorMessage('');
  };

  const checkFileSize = (size: number, type: string) => {
    const imageMaxSize = 5000000; // 5 MB
    const anyFileMaxSize = 100000000; // 100 MB

    if (size > anyFileMaxSize) {
      setErrorMessage('The file size is too big!');

      return false;
    }

    if (type === 'image' && size > imageMaxSize) {
      setErrorMessage("The image size can't be more than 5 MB!");

      return false;
    }

    return true;
  };

  const onChangeFileHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');

    const filesAmount = e.target.files?.length;

    const temporaryFilesContainer: TemporaryContainerTypes = {
      image: 0,
      video: 0,
      audio: 0,
      application: 0,
    };

    if (filesAmount) {
      for (let i = 0; i < filesAmount; i += 1) {
        if (e.target.files) {
          const file = e.target.files[i];
          const fileType = file.type.split('/')[0];

          const isAvailableSize = checkFileSize(file.size, fileType);

          if (isAvailableSize) {
            temporaryFilesContainer[fileType as keyof TemporaryContainerTypes] += 1;

            defineFileType(file, temporaryFilesContainer);
          }
        }
      }
    }
    e.target.value = ''; // eslint-disable-line
  };

  const defineFileType = (file: File, chosenFiles: TemporaryContainerTypes) => {
    const fileType = file?.type;

    const chosenFilesLength = Object.values(chosenFiles)?.reduce(
      (prev, next) => prev + next,
    );

    const chosenAndUploadedFilesAmount =
      selectedAudios.length +
      selectedDocs.length +
      selectedImages.length +
      selectedVideos.length +
      chosenFilesLength;

    if (chosenAndUploadedFilesAmount > 10 || chosenFilesLength > 10) {
      setErrorMessage('You can load 10 files maximum!');

      return;
    }

    if (fileType.includes('image')) {
      if (selectedVideos.length || chosenFiles.video) {
        setErrorMessage("You can't mix video and images in one post!");

        return;
      }

      if (chosenFiles.image + selectedImages.length <= 10) {
        setSelectedImages(state => [
          ...state,
          {
            id: uuidv4(),
            name: file?.name,
            type: file?.type,
            src: URL.createObjectURL(file),
            file,
          },
        ]);
      } else {
        setErrorMessage('Maximum quantity of images is 10!');
      }
    } else if (fileType.includes('video')) {
      if (chosenFiles.image || selectedImages.length) {
        setErrorMessage("You can't mix video and images in one post!");

        return;
      }

      if (selectedVideos.length + chosenFiles.video <= 1) {
        setSelectedVideos(state => [
          ...state,
          { id: uuidv4(), name: file?.name, src: URL.createObjectURL(file), file },
        ]);
      } else {
        setErrorMessage('Maximum quantity of videos is 1!');
      }
    } else if (fileType.includes('audio')) {
      if (selectedAudios.length + chosenFiles.audio <= 20) {
        setSelectedAudios(state => [
          ...state,
          { id: uuidv4(), name: file?.name, src: URL.createObjectURL(file), file },
        ]);
      } else {
        setErrorMessage('Maximum quantity of audios is 20!');
      }
    } else if (fileType.includes('application')) {
      if (selectedDocs.length + chosenFiles.application <= 5) {
        setSelectedDocs(state => [
          ...state,
          { id: uuidv4(), name: file?.name, src: URL.createObjectURL(file), file },
        ]);
      } else {
        setErrorMessage('Maximum quantity of documents is 5!');
      }
    }
  };

  const onClickPhoto = (e: MouseEvent<HTMLImageElement>) => {
    if (e.target) {
      setCurrentImage(e?.target?.src);
    }
    setIsFullScreen(true);
  };

  return (
    <>
      <div
        role="presentation"
        className={`${styles.modal} ${isActive && styles.modal_active}`}
        onClick={onCloseBlockHandler}
      >
        <form
          className={styles.container}
          role="presentation"
          onClick={e => e.stopPropagation()}
          onSubmit={onSubmitHandler}
        >
          <img
            role="presentation"
            src={crossIcon}
            alt="closing cross"
            className={styles.closingCross}
            onClick={onCloseBlockHandler}
          />
          <section className={styles.authorContainer}>
            <img src={profileAvatar} alt="avatar" className={styles.authorAvatar} />
            <div className={styles.authorInfo}>
              <h3 className={styles.authorName}>{profileName}</h3>
              <p className={styles.authorNickname}>{profileNickname}</p>
            </div>
          </section>
          <textarea
            value={textInput}
            onChange={onChangeTextHandler}
            maxLength={400}
            placeholder="Post something..."
            className={styles.textInput}
          />
          {selectedImages.length > 0 && (
            <section className={styles.imageContainer}>
              {selectedImages?.map(({ src, id }, i, array) =>
                array.length === 1 ? (
                  <div key={id} className={styles.singleImage}>
                    <img
                      role="presentation"
                      className={styles.imagePhoto}
                      src={src}
                      alt="contentPhoto"
                      onClick={onClickPhoto}
                    />
                    <img
                      className={styles.imageCross}
                      src={imageCross}
                      alt="cross"
                      role="presentation"
                      onClick={() => onDeleteImageHandler(id)}
                    />
                  </div>
                ) : (
                  <div key={id} className={styles.imageItem}>
                    <img
                      role="presentation"
                      className={styles.imagePhoto}
                      src={src}
                      alt="contentPhoto"
                      onClick={onClickPhoto}
                    />
                    <img
                      className={styles.imageCross}
                      src={imageCross}
                      alt="cross"
                      role="presentation"
                      onClick={() => onDeleteImageHandler(id)}
                    />
                  </div>
                ),
              )}
            </section>
          )}
          {selectedVideos.length > 0 && (
            <section className={styles.videoContainer}>
              {selectedVideos.map(props => (
                <VideoFile
                  deleteCallback={onDeleteVideoHandler}
                  key={props.id}
                  {...props}
                />
              ))}
            </section>
          )}
          {selectedAudios.length > 0 && (
            <div className={styles.audioContainer}>
              {selectedAudios.map(props => {
                return (
                  <AudioFile
                    key={props.id}
                    deleteCallback={onDeleteAudioHandler}
                    {...props}
                  />
                );
              })}
            </div>
          )}
          {selectedDocs.length > 0 && (
            <div className={styles.docContainer}>
              {selectedDocs.map(props => (
                <DocFile deleteCallback={onDeleteDocHandler} key={props.id} {...props} />
              ))}
            </div>
          )}
          <button onClick={onAddButtonClick} type="button" className={styles.addFileBtn}>
            <img className={styles.addFileIcon} src={addFileIcon} alt="file" />
            <h4 className={styles.addFileBtnTitle}>Add file</h4>
          </button>
          <input
            className={styles.inputFile}
            type="file"
            onChange={onChangeFileHandler}
            accept=".pdf,.avi,.mp4,.mov,.wav,.mp3,.flac,.alac,.m4a,.png,.jpg,.jpeg,.tiff,.pdf"
            multiple
            ref={filePicker}
          />
          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
          {isLoading ? (
            <Loader size="small" inline active className={styles.loader} />
          ) : (
            <CustomButton
              title="Post"
              type="submit"
              color="blue"
              className={styles.postButton}
              disabled={isLoading}
            />
          )}
        </form>
      </div>
      {selectedImages.length > 0 && (
        <FullScreen
          setActive={setIsFullScreen}
          active={isFullScreen}
          currentImageSrc={currentImage}
          setCurrentImageState={setCurrentImage}
          images={selectedImages.map(el => ({ presignUrl: el.src, id: el.id }))}
        />
      )}
    </>
  );
};

export default CreatePostBlock;
