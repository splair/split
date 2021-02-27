import styled from '@emotion/styled';

const StepContainer = styled.div`
  display: flex;
  margin-top: 32px;
  background-color: white;
  width: 100%;
  flex-direction: column;
  justify-content: flex-start;
  border: 2px solid rgba(221,0,104,0.8);
  border-radius: 10px;
  height: 100px;
`;

const StepNumber = styled.div`
  position: fixed;
  display: flex;
  background-color: white;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 32px;
  height: 32px;
  border: 2px solid rgba(221,0,104,0.8);
  border-radius: 50%;
  margin-left: -16px;
  margin-top: 32px;
  text-align: center;
  color: rgba(221,0,104,1);
`;

const StepTitle = styled.div`
  margin-left: 40px;
  margin-top: 16px;
  font-size: 16px;
`;

const StepContent = styled.div`
  margin-left: 40px;
  margin-top: 16px;
  font-size: 14px;
  color: gray;
`;

export const Step = ({step, title, content}) => {
  return (
    <StepContainer>
      <StepTitle>
        {title}
      </StepTitle>
      <StepContent>
        {content}
      </StepContent>
      <StepNumber>
        <div>
          {step}
        </div>
      </StepNumber>
    </StepContainer>
  );
}

